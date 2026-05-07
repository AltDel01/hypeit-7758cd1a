/**
 * wan-video: submit an asynchronous Wan video generation task to DashScope.
 * Returns a task_id which the client polls via wan-video-poll.
 *
 * Modes:
 *  - video-t2v: wan2.7-t2v (text-to-video)
 *  - video-i2v: wan2.7-i2v (image-to-video, requires firstFrameUrl)
 *  - video-r2v: wan2.7-r2v (reference-to-video, requires referenceImageUrls)
 *  - video-face-swap: wan2.2-animate-mix (requires sourceVideoUrl + faceImageUrl)
 *
 * The animate-mix face-swap model uses image2video endpoint. Others use
 * video-generation/video-synthesis.
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

interface RequestBody {
  requestId: string;
  category: 'video-t2v' | 'video-i2v' | 'video-r2v' | 'video-face-swap';
  prompt: string;
  model: string;
  firstFrameUrl?: string;
  referenceImageUrls?: string[];
  sourceVideoUrl?: string;
  faceImageUrl?: string;
  size?: string;
  duration?: number;
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

  if (!body.requestId || !body.model || !body.category) {
    return genericError(400, 'Missing required fields');
  }
  if (body.prompt && body.prompt.length > 4000) return genericError(400, 'Prompt too long');

  const { data: reqRow } = await admin
    .from('generation_requests')
    .select('id, user_id')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!reqRow || reqRow.user_id !== userId) return genericError(404, 'Request not found');

  // Build endpoint + payload by category
  let endpoint: string;
  let input: Record<string, unknown> = {};
  const parameters: Record<string, unknown> = {
    size: body.size || '1280*720',
    duration: body.duration ?? 5,
  };

  switch (body.category) {
    case 'video-t2v':
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
      input = { prompt: body.prompt };
      break;
    case 'video-i2v':
      if (!body.firstFrameUrl) return genericError(400, 'I2V requires firstFrameUrl');
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
      input = { prompt: body.prompt, media: [body.firstFrameUrl] };
      break;
    case 'video-r2v':
      if (!body.referenceImageUrls?.length) return genericError(400, 'R2V requires referenceImageUrls');
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
      input = { prompt: body.prompt, ref_images_url: body.referenceImageUrls.slice(0, 3) };
      break;
    case 'video-face-swap':
      if (!body.sourceVideoUrl || !body.faceImageUrl) {
        return genericError(400, 'Face swap requires sourceVideoUrl and faceImageUrl');
      }
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/image2video/video-synthesis`;
      input = {
        video_url: body.sourceVideoUrl,
        image_url: body.faceImageUrl,
      };
      break;
    default:
      return genericError(400, 'Unknown category');
  }

  const payload = { model: body.model, input, parameters };

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: asyncAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error('[wan-video] upstream error', upstream.status, txt);
      await markFailed(admin, body.requestId, body.model);
      return genericError(502, 'Submission failed, an editor will take over');
    }

    const json = await upstream.json();
    const taskId: string | undefined = json?.output?.task_id;
    if (!taskId) {
      console.error('[wan-video] no task_id', JSON.stringify(json).slice(0, 500));
      await markFailed(admin, body.requestId, body.model);
      return genericError(502, 'Submission failed, an editor will take over');
    }

    await admin
      .from('generation_requests')
      .update({
        status: 'in-progress',
        auto_provider: 'wan',
        auto_model: body.model,
        provider_task_id: taskId,
        auto_failed: false,
      })
      .eq('id', body.requestId);

    return ok({ ok: true, taskId, requestId: body.requestId });
  } catch (e) {
    console.error('[wan-video] exception', e);
    await markFailed(admin, body.requestId, body.model);
    return genericError(502, 'Submission failed, an editor will take over');
  }
});

async function markFailed(admin: any, requestId: string, model: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'wan',
      auto_model: model,
      auto_failed: true,
      status: 'new',
    })
    .eq('id', requestId);
}
