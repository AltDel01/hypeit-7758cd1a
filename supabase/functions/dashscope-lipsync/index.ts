/**
 * dashscope-lipsync: submit a lip-sync task to Alibaba DashScope.
 *
 * Modes:
 *  - 'portrait': image + audio → talking-portrait video (model: emo-v1)
 *  - 'video':    video + audio → relipsynced video       (model: videoretalk)
 *
 * On success, writes provider_task_id on the request and the existing
 * wan-video-poll function takes over for status polling and result download.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  DASHSCOPE_BASE,
  asyncAuthHeaders,
  getUserIdFromAuth,
  genericError,
  ok,
} from '../_shared/dashscope.ts';

interface Body {
  requestId: string;
  mode: 'portrait' | 'video';
  prompt?: string;
  portraitUrl?: string;
  sourceVideoUrl?: string;
  audioUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const userId = await getUserIdFromAuth(req, createClient);
  if (!userId) return genericError(401, 'Unauthorized');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: Body;
  try { body = await req.json(); } catch { return genericError(400, 'Invalid JSON'); }
  if (!body.requestId || !body.mode || !body.audioUrl) {
    return genericError(400, 'Missing requestId, mode or audioUrl');
  }

  const { data: reqRow } = await admin
    .from('generation_requests')
    .select('id, user_id')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!reqRow || reqRow.user_id !== userId) return genericError(404, 'Request not found');

  const resolveUrl = async (u?: string): Promise<string | undefined> => {
    if (!u) return undefined;
    if (!u.startsWith('storage:')) return u;
    const rest = u.slice('storage:'.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return undefined;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) {
      console.error('[dashscope-lipsync] sign url failed', bucket, path, error);
      return undefined;
    }
    return data.signedUrl;
  };

  const audioUrl = await resolveUrl(body.audioUrl);
  const portraitUrl = await resolveUrl(body.portraitUrl);
  const sourceVideoUrl = await resolveUrl(body.sourceVideoUrl);

  if (!audioUrl) return genericError(400, 'Could not resolve audioUrl');

  let model: string;
  let input: Record<string, unknown>;
  const endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/image2video/video-synthesis`;

  if (body.mode === 'portrait') {
    if (!portraitUrl) return genericError(400, 'Portrait mode requires portraitUrl');
    model = 'emo-v1';
    input = { image_url: portraitUrl, audio_url: audioUrl };
  } else {
    if (!sourceVideoUrl) return genericError(400, 'Video mode requires sourceVideoUrl');
    model = 'videoretalk';
    input = { video_url: sourceVideoUrl, audio_url: audioUrl };
  }

  const payload = { model, input, parameters: {} as Record<string, unknown> };

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: asyncAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error('[dashscope-lipsync] upstream error', upstream.status, txt);
      await markFailed(admin, body.requestId, model);
      return genericError(502, 'Submission failed, an editor will take over');
    }

    const json = await upstream.json();
    const taskId: string | undefined = json?.output?.task_id;
    if (!taskId) {
      console.error('[dashscope-lipsync] no task_id', JSON.stringify(json).slice(0, 500));
      await markFailed(admin, body.requestId, model);
      return genericError(502, 'Submission failed, an editor will take over');
    }

    await admin
      .from('generation_requests')
      .update({
        status: 'in-progress',
        auto_provider: 'wan',
        auto_model: model,
        provider_task_id: taskId,
        auto_failed: false,
      })
      .eq('id', body.requestId);

    return ok({ ok: true, taskId, requestId: body.requestId });
  } catch (e) {
    console.error('[dashscope-lipsync] exception', e);
    await markFailed(admin, body.requestId, model);
    return genericError(502, 'Submission failed, an editor will take over');
  }
});

async function markFailed(admin: any, requestId: string, model: string) {
  await admin
    .from('generation_requests')
    .update({ auto_provider: 'wan', auto_model: model, auto_failed: true, status: 'new' })
    .eq('id', requestId);
}
