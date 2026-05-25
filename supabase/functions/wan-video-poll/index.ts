/**
 * wan-video-poll: poll the DashScope task status and on success, download
 * the result video, store it in Supabase Storage, mark request completed.
 *
 * Client should call this every ~10 seconds until response.status is
 * 'completed' or 'failed'.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  DASHSCOPE_BASE,
  authHeaders,
  getUserIdFromAuth,
  genericError,
  ok,
} from '../_shared/dashscope.ts';

interface RequestBody {
  requestId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const userId = await getUserIdFromAuth(req, createClient);
  if (!userId) return genericError(401, 'Unauthorized');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return genericError(400, 'Invalid JSON');
  }
  if (!body.requestId) return genericError(400, 'Missing requestId');

  const { data: reqRow } = await admin
    .from('generation_requests')
    .select('id, user_id, provider_task_id, auto_model, status, result_url')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!reqRow || reqRow.user_id !== userId) return genericError(404, 'Request not found');

  // Already done?
  if (reqRow.status === 'completed' && reqRow.result_url) {
    return ok({ status: 'completed', resultUrl: reqRow.result_url });
  }

  if (!reqRow.provider_task_id) {
    return ok({ status: reqRow.status, resultUrl: reqRow.result_url });
  }

  try {
    const upstream = await fetch(
      `${DASHSCOPE_BASE}/api/v1/tasks/${reqRow.provider_task_id}`,
      { headers: authHeaders() }
    );
    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error('[wan-video-poll] upstream error', upstream.status, txt);
      return ok({ status: 'pending' });
    }

    const json = await upstream.json();
    const taskStatus: string = json?.output?.task_status || 'UNKNOWN';

    if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
      return ok({ status: 'pending', taskStatus });
    }

    if (taskStatus === 'FAILED' || taskStatus === 'UNKNOWN') {
      console.error('[wan-video-poll] task failed', JSON.stringify(json).slice(0, 500));
      await admin
        .from('generation_requests')
        .update({ auto_failed: true, status: 'new' })
        .eq('id', body.requestId);
      return ok({ status: 'failed' });
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
          .eq('id', body.requestId);
        return ok({ status: 'failed' });
      }

      // Download and store
      let storedUrl = videoUrl;
      try {
        const vRes = await fetch(videoUrl);
        if (vRes.ok) {
          const buf = new Uint8Array(await vRes.arrayBuffer());
          const path = `${userId}/${body.requestId}.mp4`;
          const { error: upErr } = await admin.storage
            .from('generated-images')
            .upload(path, buf, { contentType: 'video/mp4', upsert: true });
          if (!upErr) {
            storedUrl = `storage:generated-images/${path}`;
          }
        }
      } catch (e) {
        console.error('[wan-video-poll] storage upload failed', e);
      }

      await admin
        .from('generation_requests')
        .update({
          status: 'completed',
          result_url: storedUrl,
          completed_at: new Date().toISOString(),
          auto_failed: false,
        })
        .eq('id', body.requestId);

      return ok({ status: 'completed', resultUrl: storedUrl });
    }

    return ok({ status: 'pending', taskStatus });
  } catch (e) {
    console.error('[wan-video-poll] exception', e);
    return ok({ status: 'pending' });
  }
});
