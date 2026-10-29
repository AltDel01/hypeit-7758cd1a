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
  getUserIdFromAuth,
  genericError,
  ok,
} from '../_shared/dashscope.ts';
import { pollVideoTask } from '../_shared/modelark.ts';
import { notifyResultReady } from '../_shared/resultEmail.ts';

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
    .select('id, user_id, provider_task_id, auto_provider, auto_model, status, result_url')
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
    const polled = await pollVideoTask(reqRow.auto_provider, reqRow.provider_task_id);
    if (!polled || polled.state === 'pending') {
      return ok({ status: 'pending' });
    }

    if (polled.state === 'failed') {
      await admin
        .from('generation_requests')
        .update({ auto_failed: true, status: 'new', failure_reason: polled.reason })
        .eq('id', body.requestId);
      return ok({ status: 'failed' });
    }

    {
      const videoUrl = polled.videoUrl;

      if (!videoUrl) {
        await admin
          .from('generation_requests')
          .update({ auto_failed: true, status: 'new', failure_reason: 'Generation finished without a result. Please try again.' })
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
          failure_reason: null,
        })
        .eq('id', body.requestId);

      await notifyResultReady(admin, body.requestId);

      return ok({ status: 'completed', resultUrl: storedUrl });
    }
  } catch (e) {
    console.error('[wan-video-poll] exception', e);
    return ok({ status: 'pending' });
  }
});

