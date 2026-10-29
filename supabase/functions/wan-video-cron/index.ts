/**
 * wan-video-cron: server-side poller that finalizes stuck Wan video requests.
 *
 * Runs unattended (no user session) so videos still get saved even when the
 * user has closed the page and client-side polling has stopped. Scheduled via
 * pg_cron. It only finalizes tasks already recorded in our DB by polling
 * DashScope, so it carries no sensitive surface.
 *
 * For every request that is 'new' | 'in-progress' with a provider_task_id and
 * no result yet, it polls DashScope and, on SUCCEEDED, downloads the MP4 into
 * the generated-images bucket and marks the row completed.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  genericError,
  ok,
} from '../_shared/dashscope.ts';
import { pollVideoTask } from '../_shared/modelark.ts';
import { notifyResultReady } from '../_shared/resultEmail.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Only rows we have not already given up on. Without the auto_failed filter
  // every previously failed task is re-polled on every single cron tick.
  const { data: stuck, error } = await admin
    .from('generation_requests')
    .select('id, user_id, provider_task_id, auto_provider, status, result_url, created_at')
    .or('auto_provider.eq.modelark,category.eq.video-lipsync')
    .in('status', ['new', 'in-progress'])
    .eq('auto_failed', false)
    .not('provider_task_id', 'is', null)
    .is('result_url', null);

  if (error) return genericError(500, 'DB query failed');

  // Old Alibaba jobs are stopped, never followed: cancel queued tasks at the
  // provider (best effort) and close the rows so nothing re-submits them.
  const { data: legacy } = await admin
    .from('generation_requests')
    .select('id, provider_task_id')
    .in('auto_provider', ['wan', 'qwen'])
    .neq('category', 'video-lipsync')
    .in('status', ['new', 'in-progress'])
    .eq('auto_failed', false)
    .is('result_url', null);
  const qwenKey = Deno.env.get('QWEN_API_KEY');
  for (const l of legacy ?? []) {
    if (l.provider_task_id && qwenKey) {
      await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${encodeURIComponent(l.provider_task_id)}/cancel`, {
        method: 'POST', headers: { Authorization: `Bearer ${qwenKey}` },
      }).catch(() => null);
    }
    await admin.from('generation_requests')
      .update({ auto_failed: true, failure_reason: 'This generation was stopped. Please try again.' })
      .eq('id', l.id);
  }

  // Safety net: requests that were never submitted to the provider (no task
  // id) would otherwise show 'Processing' forever. After 15 minutes hand them
  // to the editor queue.
  const NEVER_SUBMITTED_MINUTES = 15;
  const cutoff = new Date(Date.now() - NEVER_SUBMITTED_MINUTES * 60000).toISOString();
  const { data: orphans } = await admin
    .from('generation_requests')
    .select('id')
    .not('auto_provider', 'is', null)
    .in('status', ['new', 'in-progress'])
    .eq('auto_failed', false)
    .is('provider_task_id', null)
    .is('result_url', null)
    .lt('created_at', cutoff);

  for (const o of orphans ?? []) {
    await admin
      .from('generation_requests')
      .update({
        auto_failed: true,
        status: 'new',
        failure_reason:
          'This request could not be submitted. Please try again.',
      })
      .eq('id', o.id);
  }
  if (orphans?.length) console.log('[wan-cron] orphaned', orphans.length);

  const results: Array<{ id: string; status: string }> = [];
  // Provider tasks that never leave the queue must not hang forever.
  const STALE_MINUTES = 30;

  for (const row of stuck ?? []) {
    try {
      const ageMinutes =
        (Date.now() - new Date(row.created_at as string).getTime()) / 60000;

      const polled = await pollVideoTask(row.auto_provider, row.provider_task_id);
      if (!polled) {
        results.push({ id: row.id, status: 'upstream-error' });
        continue;
      }

      if (polled.state === 'pending') {
        if (ageMinutes > STALE_MINUTES) {
          await admin
            .from('generation_requests')
            .update({
              auto_failed: true,
              status: 'new',
              failure_reason:
                'Generation timed out in the queue. Please try again, a shorter duration or lower resolution usually goes through faster.',
            })
            .eq('id', row.id);
          results.push({ id: row.id, status: 'timed-out' });
          continue;
        }
        results.push({ id: row.id, status: 'pending' });
        continue;
      }
      if (polled.state === 'failed') {
        await admin
          .from('generation_requests')
          .update({ auto_failed: true, status: 'new', failure_reason: polled.reason })
          .eq('id', row.id);
        results.push({ id: row.id, status: 'failed' });
        continue;
      }
      {
        const videoUrl = polled.videoUrl;


        if (!videoUrl) {
          await admin
            .from('generation_requests')
            .update({ auto_failed: true, status: 'new', failure_reason: 'Generation finished without a result. Please try again.' })
            .eq('id', row.id);
          results.push({ id: row.id, status: 'no-url' });
          continue;
        }

        let storedUrl = videoUrl;
        try {
          const vRes = await fetch(videoUrl);
          if (vRes.ok) {
            const buf = new Uint8Array(await vRes.arrayBuffer());
            const path = `${row.user_id}/${row.id}.mp4`;
            const { error: upErr } = await admin.storage
              .from('generated-images')
              .upload(path, buf, { contentType: 'video/mp4', upsert: true });
            if (!upErr) storedUrl = `storage:generated-images/${path}`;
          }
        } catch (e) {
          console.error('[wan-cron] storage upload failed', row.id, e);
        }

        await admin
          .from('generation_requests')
          .update({
            status: 'completed',
            result_url: storedUrl,
            completed_at: new Date().toISOString(),
            auto_failed: false,
            failure_reason: null,
          })
          .eq('id', row.id);

        await notifyResultReady(admin, row.id);

        results.push({ id: row.id, status: 'completed' });
      }

    } catch (e) {
      console.error('[wan-cron] exception for', row.id, e);
      results.push({ id: row.id, status: 'exception' });
    }
  }

  console.log('[wan-cron] scanned', stuck?.length ?? 0, JSON.stringify(results));
  return ok({ scanned: stuck?.length ?? 0, results });
});
