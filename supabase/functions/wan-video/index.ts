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
  
  getUserIdFromAuth,
  genericError,
  ok,
  uploadToDashScopeOss,
  normalizeImageForWan,
  createWanVideoTask,
  clampWanDuration,
  needsLongFormModel,
  WAN_LONGFORM_MODEL,
  friendlyFailureReason,
} from '../_shared/dashscope.ts';
import {
  arkCreateVideoTask, arkGenerateImages, arkImageSize, arkSafeReferencePrompt, isArkRealPersonError,
  seedanceDirections, bytesToDataUrl, clampArkDuration, ARK_PROVIDER, ARK_VIDEO_MODEL, type ArkMediaRole,
} from '../_shared/modelark.ts';

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
    .replace(/\s*\|\s*(Aspect|Resolution|Duration|Timeline|Media|First frame|Last frame)\s*:[^|\n]*/gi, '')
    .trim();
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

  const { data: reqRow } = await admin
    .from('generation_requests')
    .select('id, user_id')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!reqRow || reqRow.user_id !== userId) return genericError(404, 'Request not found');

  // No artificial prompt cap: Wan accepts long prompts (the ModelStudio
  // playground proves it). Only a far-above-real-usage sanity ceiling remains,
  // and anything Alibaba itself dislikes comes back as a provider error we
  // surface, rather than a request we silently block here.
  if (body.prompt && body.prompt.length > 40000) {
    await markFailed(admin, body.requestId, body.model, 'Prompt is unusually long. Please shorten it.');
    return genericError(400, 'Prompt too long');
  }

  // All modes except face swap run on BytePlus ModelArk (Seedance).
  if (body.category !== 'video-face-swap') {
    return await dispatchModelArk(admin, body, userId);
  }


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
    await markFailed(admin, body.requestId, body.model, 'Reference media upload to provider failed');
    return genericError(502, 'Submission failed');
  }


  // Build endpoint + payload by category. Wan2.7 uses unified
  // video-generation/video-synthesis endpoint with `media: [{type, url}]`.
  let endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
  let input: Record<string, unknown> = {};
  // Clean creative prompt (technical settings line removed) for the model.
  const modelPrompt = cleanPromptForModel(body.prompt);
  // Duration: prefer the explicit body value; fall back to the value recorded
  // in the prompt metadata so it is never silently lost. Wan3.0 supports up to
  // 30s, Wan2.7 up to 15s.
  const promptDuration = parseInt(parseSetting(body.prompt, 'Duration') || '', 10);
  const rawDuration = body.duration ?? (Number.isFinite(promptDuration) ? promptDuration : 5);
  const duration = clampWanDuration(rawDuration, 5);
  // Wan video models only accept '720P' or '1080P'. Normalize any
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
  // Clips longer than 15s only exist on the wan3.0 long-form model.
  const longForm = needsLongFormModel(duration) && body.category !== 'video-face-swap';
  const requestModel = longForm ? WAN_LONGFORM_MODEL : body.model;


  // Every early return below marks the row failed first: a request that never
  // reaches the provider must never keep showing "Processing" to the user.
  const bail = async (reason: string) => {
    await markFailed(admin, body.requestId, body.model, reason)
    return genericError(400, 'Submission failed');
  };

  switch (body.category) {
    case 'video-t2v':
      input = { prompt: modelPrompt };
      break;
    case 'video-i2v':
      if (!firstFrameUrl) return await bail('The reference image could not be read. Please re-upload it.');
      input = {
        prompt: modelPrompt,
        media: [{ type: 'first_frame', url: firstFrameUrl }],
      };
      break;
    case 'video-kf2v':
      if (!firstFrameUrl || !lastFrameUrl) {
        return await bail('Both the first and last frame images are required. Please re-upload them.');
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
      if (!referenceImageUrls?.length) {
        return await bail('The reference images could not be read. Please re-upload them.');
      }
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
        return await bail('A source video and a face image are both required for face swap.');
      }
      endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/image2video/video-synthesis`;
      input = { video_url: sourceVideoUrl, image_url: faceImageUrl };
      break;
    default:
      return await bail('This generation mode is not supported.');
  }
  console.log(
    '[wan-video] dispatch', body.category, requestModel,
    'duration=' + duration, 'resolution=' + resolution,
    JSON.stringify(input).slice(0, 300)
  );

  try {
    const headers: Record<string, string> = {};
    // Required when input media uses oss:// URLs uploaded to DashScope storage.
    if (usedOss) headers['X-DashScope-OssResourceResolve'] = 'enable';

    const result = await createWanVideoTask({
      endpoint,
      model: requestModel,
      input,
      parameters,
      headers,
      fallbackModel: longForm ? body.model : undefined,
    });

    if (!result.ok) {
      await markFailed(
        admin, body.requestId, requestModel,
        humanizeProviderError(result.status, result.detail),
      );
      return genericError(502, 'Submission failed');
    }

    const taskId = result.taskId;

    await admin
      .from('generation_requests')
      .update({
        status: 'in-progress',
        auto_provider: 'wan',
        auto_model: result.model,
        provider_task_id: taskId,
        auto_failed: false,
        failure_reason: null,
      })
      .eq('id', body.requestId);

    return ok({ ok: true, taskId, model: result.model, duration: result.duration, requestId: body.requestId });
  } catch (e) {
    console.error('[wan-video] exception', e);
    await markFailed(admin, body.requestId, body.model, 'Network error while submitting to provider');
    return genericError(502, 'Submission failed');
  }
});

function humanizeProviderError(_status: number, raw: string): string {
  // Never surface raw provider payloads (they contain signed OSS URLs and
  // internal error JSON). All user-facing reasons go through the shared
  // friendly mapper; raw detail stays in function logs only.
  return friendlyFailureReason(raw);
}

async function markFailed(admin: any, requestId: string, model: string, reason?: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'wan',
      auto_model: model,
      auto_failed: true,
      status: 'new',
      failure_reason: friendlyFailureReason(reason),
    })
    .eq('id', requestId);
}


/** Resolve a storage:/https reference into something ModelArk can read (data URL for private files). */
async function toArkImage(admin: any, u?: string): Promise<string | undefined> {
  if (!u) return undefined;
  if (!u.startsWith('storage:')) return u;
  const rest = u.slice('storage:'.length);
  const slash = rest.indexOf('/');
  if (slash < 0) return undefined;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) {
    console.error('[wan-video] storage download failed', bucket, path, error?.message);
    return undefined;
  }
  const raw = new Uint8Array(await data.arrayBuffer());
  const rawType = (data as any).type || guessTypeFromExt(path);
  const { bytes, contentType } = await normalizeImageForWan(raw, rawType);
  return bytesToDataUrl(bytes, contentType);
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

const SAFE_BUCKET = 'generated-images';

/** Previously rebuilt (person-free) version of this reference, if any. */
async function cachedSafeReference(admin: any, userId: string, src: string, role: ArkMediaRole): Promise<string | undefined> {
  const path = `${userId}/ark-safe/${role}-${await sha256Hex(src)}.jpg`;
  const { data, error } = await admin.storage.from(SAFE_BUCKET).download(path);
  if (error || !data) return undefined;
  return bytesToDataUrl(new Uint8Array(await data.arrayBuffer()), 'image/jpeg');
}

/**
 * Rebuild a reference Seedance rejected for showing a real person, using
 * Seedream, and cache it so later days / retries skip the rejected round-trip.
 */
async function buildSafeReference(admin: any, userId: string, src: string, role: ArkMediaRole, ratio?: string): Promise<string | undefined> {
  const gen = await arkGenerateImages({
    prompt: arkSafeReferencePrompt(role),
    images: [src],
    // 1K + fast keeps this around 20s; full quality takes over two minutes.
    size: '1K',
    fast: true,
  });
  if (!gen.ok) {
    console.error('[wan-video] safe reference rebuild failed', gen.status, gen.detail.slice(0, 300));
    return undefined;
  }
  try {
    const r = await fetch(gen.urls[0]);
    if (!r.ok) return gen.urls[0];
    const bytes = new Uint8Array(await r.arrayBuffer());
    const path = `${userId}/ark-safe/${role}-${await sha256Hex(src)}.jpg`;
    await admin.storage.from(SAFE_BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
    return bytesToDataUrl(bytes, 'image/jpeg');
  } catch (e) {
    console.error('[wan-video] safe reference cache failed', e);
    return gen.urls[0];
  }
}

async function dispatchModelArk(admin: any, body: RequestBody, userId: string): Promise<Response> {
  // Seedance reads natural language, so style / camera / motion tags become directions.
  const fail = async (reason: string, status = 400) => {
    const friendly = friendlyFailureReason(reason);
    await admin.from('generation_requests').update({
      auto_provider: ARK_PROVIDER, auto_model: ARK_VIDEO_MODEL, auto_failed: true,
      status: 'new', failure_reason: friendly,
    }).eq('id', body.requestId);
    return genericError(status, friendly);
  };

  const modelPrompt = seedanceDirections(cleanPromptForModel(body.prompt));
  const promptDurationRaw = parseSetting(body.prompt, 'Duration') || '';
  const promptDuration = /smart/i.test(promptDurationRaw) ? 'smart' : parseInt(promptDurationRaw, 10);
  const duration = clampArkDuration(body.duration ?? (promptDuration === 'smart' || Number.isFinite(promptDuration) ? promptDuration : 'smart'), 5);
  const resolution = body.resolution || parseSetting(body.prompt, 'Resolution') || '1080p';
  const ratio = parseSetting(body.prompt, 'Aspect') || body.size;

  const images: Array<{ url: string; role: ArkMediaRole }> = [];
  try {
    if (body.category === 'video-i2v' || body.category === 'video-kf2v') {
      const first = await toArkImage(admin, body.firstFrameUrl);
      if (!first) return await fail('The reference image could not be read. Please re-upload it.');
      images.push({ url: first, role: 'first_frame' });
      if (body.category === 'video-kf2v') {
        const last = await toArkImage(admin, body.lastFrameUrl);
        if (!last) return await fail('Both the first and last frame images are required. Please re-upload them.');
        images.push({ url: last, role: 'last_frame' });
      }
    } else if (body.category === 'video-r2v') {
      for (const u of (body.referenceImageUrls || []).slice(0, 9)) {
        const r = await toArkImage(admin, u);
        if (r) images.push({ url: r, role: 'reference_image' });
      }
      if (!images.length) return await fail('The reference images could not be read. Please re-upload them.');
    }
  } catch (e) {
    console.error('[wan-video] reference prep failed', e);
    return await fail('The reference image could not be read. Please re-upload it.', 502);
  }

  // Reuse a person-free version made earlier for the same photo, so Seedance
  // doesn't reject it again (and the user doesn't wait for a second rebuild).
  const prepared = await Promise.all(images.map(async (img) => {
    const cached = await cachedSafeReference(admin, userId, img.url, img.role).catch(() => undefined);
    return cached ? { url: cached, role: img.role, original: img.url } : { ...img, original: img.url };
  }));

  console.log('[wan-video] modelark dispatch', body.category, 'duration=' + duration, 'images=' + prepared.length,
    'cachedSafe=' + prepared.filter((p) => p.url !== p.original).length);
  const markSubmitted = async (taskId: string, model: string) => {
    await admin.from('generation_requests').update({
      status: 'in-progress', auto_provider: ARK_PROVIDER, auto_model: model,
      provider_task_id: taskId, auto_failed: false, failure_reason: null,
    }).eq('id', body.requestId);
  };
  try {
    const result = await arkCreateVideoTask({ prompt: modelPrompt, duration, resolution, ratio, images: prepared });
    if (result.ok) {
      await markSubmitted(result.taskId, result.model);
      return ok({ ok: true, taskId: result.taskId, model: result.model, duration: result.duration, requestId: body.requestId });
    }
    if (!(prepared.length && isArkRealPersonError(result.detail))) return await fail(result.detail, 502);

    // The photo shows a person, so Seedance refused it. Rebuilding it with
    // Seedream takes a minute or more, so finish in the background and answer
    // now; the request stays "Processing" and the UI picks up the result.
    console.log('[wan-video] real-person reference rejected, rebuilding with Seedream');
    const rebuildAndSubmit = async () => {
      try {
        const rebuilt = await Promise.all(prepared.map(async (p) => {
          if (p.url !== p.original) return p; // already a safe version
          const safe = await buildSafeReference(admin, userId, p.original, p.role, ratio);
          return safe ? { ...p, url: safe } : null;
        }));
        if (!rebuilt.every(Boolean)) { await fail(result.detail, 502); return; }
        const retry = await arkCreateVideoTask({
          prompt: modelPrompt, duration, resolution, ratio,
          images: rebuilt.map((r) => ({ url: r!.url, role: r!.role })),
        });
        if (!retry.ok) { await fail(retry.detail, 502); return; }
        await markSubmitted(retry.taskId, retry.model);
        console.log('[wan-video] submitted with rebuilt reference', body.requestId);
      } catch (e) {
        console.error('[wan-video] rebuild exception', e);
        await fail('Network error while submitting to provider', 502);
      }
    };
    const er = (globalThis as any).EdgeRuntime;
    if (er?.waitUntil) er.waitUntil(rebuildAndSubmit());
    else await rebuildAndSubmit();
    return ok({ ok: true, pending: true, requestId: body.requestId });
  } catch (e) {
    console.error('[wan-video] modelark exception', e);
    return await fail('Network error while submitting to provider', 502);
  }
}
