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
  DASHSCOPE_BASE,
  authHeaders,
  genericError,
  ok,
} from '../_shared/dashscope.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: stuck, error } = await admin
    .from('generation_requests')
    .select('id, user_id, provider_task_id, status, result_url')
    .eq('auto_provider', 'wan')
    .in('status', ['new', 'in-progress'])
    .not('provider_task_id', 'is', null)
    .is('result_url', null);

  if (error) return genericError(500, 'DB query failed');

  const results: Array<{ id: string; status: string }> = [];

  for (const row of stuck ?? []) {
    try {
      const upstream = await fetch(
        `${DASHSCOPE_BASE}/api/v1/tasks/${row.provider_task_id}`,
        { headers: authHeaders() }
      );
      if (!upstream.ok) {
        results.push({ id: row.id, status: 'upstream-error' });
        continue;
      }
      const json = await upstream.json();
      const taskStatus: string = json?.output?.task_status || 'UNKNOWN';

      if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        results.push({ id: row.id, status: 'pending' });
        continue;
      }
      if (taskStatus === 'FAILED' || taskStatus === 'UNKNOWN') {
        await admin
          .from('generation_requests')
          .update({ auto_failed: true, status: 'new' })
          .eq('id', row.id);
        results.push({ id: row.id, status: 'failed' });
        continue;
      }
      if (taskStatus === 'SUCCEEDED') {
        const videoUrl: string | undefined =
          json?.output?.video_url ||
          json?.output?.results?.[0]?.video_url ||
          json?.output?.results?.[0]?.url;

        if (!videoUrl) {
          await admin
            .from('generation_requests')
            .update({ auto_failed: true, status: 'new' })
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
          })
          .eq('id', row.id);

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
