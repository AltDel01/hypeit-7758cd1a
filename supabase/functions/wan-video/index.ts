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
  uploadToDashScopeOss,
  normalizeImageForWan,
} from '../_shared/dashscope.ts';

function guessTypeFromExt(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    gif: 'image/gif', bmp: 'image/bmp', mp4: 'video/mp4', mov: 'video/quicktime',
  };
  return map[ext] || 'application/octet-stream';
}

interface RequestBody {
  requestId: string;
  category: 'video-t2v' | 'video-i2v' | 'video-kf2v' | 'video-r2v' | 'video-face-swap';
  prompt: string;
  model: string;
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  referenceImageUrls?: string[];
  sourceVideoUrl?: string;
  faceImageUrl?: string;
  size?: string;
  resolution?: string;
  duration?: number;
}

/**
 * Extract a `| Key: value` setting from the recorded prompt metadata.
 * The homepage composer embeds technical settings as a trailing pipe line
 * (e.g. "...| Aspect: 16:9 | Resolution: 1080P | Duration: 15s").
 */
function parseSetting(prompt: string | undefined, key: string): string | undefined {
  if (!prompt) return undefined;
  const re = new RegExp(`\\|\\s*${key}\\s*:\\s*([^|\\n]+)`, 'i');
  const m = prompt.match(re);
  return m ? m[1].trim() : undefined;
}

/**
 * Remove the trailing technical settings line so it is not sent to DashScope
 * as part of the creative prompt. Keeps the base prompt and the
 * "[Style | Camera | Motion intensity]" creative block intact.
 */
function cleanPromptForModel(prompt: string | undefined): string {
  if (!prompt) return '';
  return prompt
    .replace(/\s*\|\s*(Aspect|Resolution|Duration|Timeline|First frame|Last frame)\s*:[^|\n]*/gi, '')
    .trim();
}


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

  // Resolve storage: refs by downloading the bytes and uploading them to
  // DashScope's own OSS storage (oss:// URL). This is Alibaba's officially
  // supported input method and avoids their validator fetching external URLs
  // (signed Supabase URLs AND our public proxy were both rejected with
  // "can not read image").
  let usedOss = false;
  const resolveUrl = async (u?: string): Promise<string | undefined> => {
    if (!u) return undefined;
    if (!u.startsWith('storage:')) return u;
    const rest = u.slice('storage:'.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return undefined;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    if (!bucket || !path) return undefined;
    const { data, error } = await admin.storage.from(bucket).download(path);
    if (error || !data) {
      console.error('[wan-video] storage download failed', bucket, path, error?.message);
      return undefined;
    }
    const raw = new Uint8Array(await data.arrayBuffer());
    const filename = path.split('/').pop() || 'file';
    const rawType = (data as any).type || guessTypeFromExt(path);
    const { bytes, contentType } = await normalizeImageForWan(raw, rawType);
    const ossUrl = await uploadToDashScopeOss(body.model, bytes, filename, contentType);
    usedOss = true;
    console.log('[wan-video] uploaded to DashScope OSS', filename, bytes.length, ossUrl.slice(0, 80));
    return ossUrl;
  };

  const resolveUrls = async (arr?: string[]): Promise<string[] | undefined> => {
    if (!arr?.length) return undefined;
    const out: string[] = [];
    for (const u of arr) {
      const r = await resolveUrl(u);
      if (r) out.push(r);
    }
    return out;
  };

  let firstFrameUrl: string | undefined;
  let lastFrameUrl: string | undefined;
  let referenceImageUrls: string[] | undefined;
  let sourceVideoUrl: string | undefined;
  let faceImageUrl: string | undefined;
  try {
    firstFrameUrl = await resolveUrl(body.firstFrameUrl);
    lastFrameUrl = await resolveUrl(body.lastFrameUrl);
    referenceImageUrls = await resolveUrls(body.referenceImageUrls);
    sourceVideoUrl = await resolveUrl(body.sourceVideoUrl);
    faceImageUrl = await resolveUrl(body.faceImageUrl);
  } catch (e) {
    console.error('[wan-video] OSS upload failed', e);
    await markFailed(admin, body.requestId, body.model);
    return genericError(502, 'Submission failed, an editor will take over');
  }

  // Build endpoint + payload by category. Wan2.7 uses unified
  // video-generation/video-synthesis endpoint with `media: [{type, url}]`.
  let endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
  let input: Record<string, unknown> = {};
  // Clean creative prompt (technical settings line removed) for the model.
  const modelPrompt = cleanPromptForModel(body.prompt);
  // Duration: prefer the explicit body value; fall back to the value recorded
  // in the prompt metadata so it is never silently lost. Wan2.7 supports 2-15s.
  const promptDuration = parseInt(parseSetting(body.prompt, 'Duration') || '', 10);
  const rawDuration = body.duration ?? (Number.isFinite(promptDuration) ? promptDuration : 5);
  const duration = Math.max(2, Math.min(15, Math.round(rawDuration)));
  // Wan2.x video models only accept '720P' or '1080P'. Normalize any
  // unsupported value (e.g. legacy '480P' or '4K') so a request never gets
  // rejected and stuck in processing. Fall back to the prompt metadata too.
  const rawResolution = String(
    (body as any).resolution || parseSetting(body.prompt, 'Resolution') || '1080P'
  ).toUpperCase();
  const resolution = rawResolution === '720P' ? '720P' : '1080P';
  const parameters: Record<string, unknown> = {
    resolution,
    duration,
  };

  switch (body.category) {
    case 'video-t2v':
      input = { prompt: modelPrompt };
      break;
    case 'video-i2v':
      if (!firstFrameUrl) return genericError(400, 'I2V requires firstFrameUrl');
      input = {
        prompt: modelPrompt,
        media: [{ type: 'first_frame', url: firstFrameUrl }],
      };
      break;
    case 'video-kf2v':
      if (!firstFrameUrl || !lastFrameUrl) {
        return genericError(400, 'KF2V requires both firstFrameUrl and lastFrameUrl');
      }
      input = {
        prompt: modelPrompt,
        media: [
          { type: 'first_frame', url: firstFrameUrl },
          { type: 'last_frame', url: lastFrameUrl },
        ],
      };
      break;
    case 'video-r2v':
      if (!referenceImageUrls?.length) return genericError(400, 'R2V requires referenceImageUrls');
      input = {
        prompt: modelPrompt,
        media: referenceImageUrls.slice(0, 3).map((url) => ({
          type: 'reference_image',
          url,
        })),
      };
      break;
    case 'video-face-swap':
      if (!sourceVideoUrl || !faceImageUrl) {
        return genericError(400, 'Face swap requires sourceVideoUrl and faceImageUrl');
      }
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/image2video/video-synthesis`;
      input = { video_url: sourceVideoUrl, image_url: faceImageUrl };
      break;
    default:
      return genericError(400, 'Unknown category');
  }
  console.log(
    '[wan-video] dispatch', body.category, body.model,
    'duration=' + duration, 'resolution=' + resolution,
    JSON.stringify(input).slice(0, 300)
  );

  const payload = { model: body.model, input, parameters };

  try {
    const headers: Record<string, string> = { ...asyncAuthHeaders() };
    // Required when input media uses oss:// URLs uploaded to DashScope storage.
    if (usedOss) headers['X-DashScope-OssResourceResolve'] = 'enable';
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
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
