/**
 * Shared DashScope (Alibaba Cloud Model Studio) helpers.
 * Used by qwen-image, wan-video, wan-video-poll edge functions.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Singapore region endpoint (international)
export const DASHSCOPE_BASE = 'https://dashscope-intl.aliyuncs.com';

export function authHeaders(): Record<string, string> {
  const key = Deno.env.get('QWEN_API_KEY');
  if (!key) throw new Error('QWEN_API_KEY not configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Async DashScope task header. Required for video-synthesis endpoints.
 */
export function asyncAuthHeaders(): Record<string, string> {
  return {
    ...authHeaders(),
    'X-DashScope-Async': 'enable',
  };
}

/**
 * Wan's image validator rejects images with any side > 2000px (or < 360px),
 * reporting it misleadingly as "can not read image". Downscale oversized
 * images before upload. Returns { bytes, contentType } (JPEG when resized).
 */
const WAN_MAX_SIDE = 2000;

function bilinearResize(
  src: Uint8Array, sw: number, sh: number, dw: number, dh: number
): Uint8Array {
  const dst = new Uint8Array(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const fy = (y + 0.5) * sh / dh - 0.5;
    const y0 = Math.max(0, Math.floor(fy));
    const y1 = Math.min(sh - 1, y0 + 1);
    const wy = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = (x + 0.5) * sw / dw - 0.5;
      const x0 = Math.max(0, Math.floor(fx));
      const x1 = Math.min(sw - 1, x0 + 1);
      const wx = fx - x0;
      const di = (y * dw + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src[(y0 * sw + x0) * 4 + c];
        const p01 = src[(y0 * sw + x1) * 4 + c];
        const p10 = src[(y1 * sw + x0) * 4 + c];
        const p11 = src[(y1 * sw + x1) * 4 + c];
        dst[di + c] =
          p00 * (1 - wx) * (1 - wy) + p01 * wx * (1 - wy) +
          p10 * (1 - wx) * wy + p11 * wx * wy;
      }
    }
  }
  return dst;
}

// Wan rejects any image with a side below 240px; keep a safe margin.
const WAN_MIN_SIDE = 384;

function wanScale(w: number, h: number): number {
  let scale = Math.min(1, WAN_MAX_SIDE / Math.max(w, h));
  const minSide = Math.min(w, h) * scale;
  if (minSide < WAN_MIN_SIDE) {
    scale = Math.min(scale * (WAN_MIN_SIDE / minSide), WAN_MAX_SIDE / Math.max(w, h));
  }
  return scale;
}

export async function normalizeImageForWan(
  bytes: Uint8Array,
  contentType: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (!contentType.startsWith('image/')) return { bytes, contentType };

  // Path 1: imagescript (handles png/webp/baseline jpeg)
  try {
    const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
    const img = await Image.decode(bytes);
    const scale = wanScale(img.width, img.height);
    if (scale === 1) return { bytes, contentType };
    img.resize(
      Math.max(1, Math.round(img.width * scale)),
      Math.max(1, Math.round(img.height * scale))
    );
    const out = await img.encodeJPEG(90);
    console.log(`[dashscope] resized (imagescript) -> ${img.width}x${img.height}, ${out.length}B`);
    return { bytes: out, contentType: 'image/jpeg' };
  } catch (e) {
    console.warn('[dashscope] imagescript decode failed, trying jpeg-js', String(e));
  }

  // Path 2: jpeg-js (handles progressive JPEGs that imagescript cannot decode)
  try {
    const jpeg = await import('npm:jpeg-js@0.4.4');
    const decoded = jpeg.decode(bytes, { useTArray: true, maxMemoryUsageInMB: 1024 });
    const { width: sw, height: sh } = decoded;
    const scale = wanScale(sw, sh);
    if (scale === 1) return { bytes, contentType };
    const dw = Math.max(1, Math.round(sw * scale));
    const dh = Math.max(1, Math.round(sh * scale));
    const resized = bilinearResize(new Uint8Array(decoded.data), sw, sh, dw, dh);
    const out = jpeg.encode({ data: resized, width: dw, height: dh }, 90);
    console.log(`[dashscope] resized (jpeg-js) ${sw}x${sh} -> ${dw}x${dh}, ${out.data.length}B`);
    return { bytes: new Uint8Array(out.data), contentType: 'image/jpeg' };
  } catch (e) {
    console.error('[dashscope] image normalize failed entirely, using original', e);
    return { bytes, contentType };
  }
}


/**
 * Upload a file to DashScope's own temporary OSS storage and return an
 * `oss://` URL. This is Alibaba's officially supported way to provide input
 * media; it avoids their image validator fetching external URLs (which is
 * unreliable for Supabase storage/proxy links).
 *
 * Requests using the returned URL must include the header
 * `X-DashScope-OssResourceResolve: enable`.
 */
export async function uploadToDashScopeOss(
  model: string,
  bytes: Uint8Array,
  filename: string,
  contentType: string
): Promise<string> {
  const polRes = await fetch(
    `${DASHSCOPE_BASE}/api/v1/uploads?action=getPolicy&model=${encodeURIComponent(model)}`,
    { headers: authHeaders() }
  );
  if (!polRes.ok) {
    throw new Error(`getPolicy failed: ${polRes.status} ${await polRes.text()}`);
  }
  const pol = (await polRes.json())?.data;
  if (!pol?.upload_host || !pol?.upload_dir) {
    throw new Error('getPolicy returned invalid data');
  }

  const key = `${pol.upload_dir}/${Date.now()}-${filename}`;
  const form = new FormData();
  form.append('OSSAccessKeyId', pol.oss_access_key_id);
  form.append('Signature', pol.signature);
  form.append('policy', pol.policy);
  form.append('x-oss-object-acl', pol.x_oss_object_acl);
  form.append('x-oss-forbid-overwrite', pol.x_oss_forbid_overwrite);
  form.append('key', key);
  form.append('success_action_status', '200');
  form.append('file', new Blob([bytes], { type: contentType }), filename);

  const upRes = await fetch(pol.upload_host, { method: 'POST', body: form });
  if (!upRes.ok) {
    throw new Error(`OSS upload failed: ${upRes.status} ${await upRes.text()}`);
  }
  return `oss://${key}`;
}

/* ------------------------------------------------------------------ *
 * Wan video models
 * wan3.0-video is the long-form model: single model for text/image
 * driven generation, up to 30 seconds. wan2.7-* caps at 15 seconds.
 * ------------------------------------------------------------------ */

export const WAN_LONGFORM_MODEL = 'wan3.0-video';
export const WAN_MAX_DURATION = 30;
export const WAN_LEGACY_MAX_DURATION = 15;

/** Clamp any requested clip length to what Wan accepts (2-30s). */
export function clampWanDuration(raw: unknown, fallback = 5): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(2, Math.min(WAN_MAX_DURATION, Math.round(n)));
}

/** Anything longer than 15s must run on the wan3.0 long-form model. */
export function needsLongFormModel(seconds: number): boolean {
  return seconds > WAN_LEGACY_MAX_DURATION;
}

export type WanTaskResult =
  | { ok: true; taskId: string; model: string; duration: number }
  | { ok: false; status: number; detail: string };

/**
 * Submit a DashScope video-synthesis task. When the long-form wan3.0 model is
 * used and the provider rejects it (not yet enabled in the region/account),
 * the call is retried once on the legacy model with the duration clamped to
 * 15s so the user still gets a clip instead of a stuck request.
 */
export async function createWanVideoTask(opts: {
  endpoint: string;
  model: string;
  input: Record<string, unknown>;
  parameters: Record<string, unknown>;
  headers?: Record<string, string>;
  fallbackModel?: string;
}): Promise<WanTaskResult> {
  const attempt = async (model: string, parameters: Record<string, unknown>) => {
    const res = await fetch(opts.endpoint, {
      method: 'POST',
      headers: { ...asyncAuthHeaders(), ...(opts.headers || {}) },
      body: JSON.stringify({ model, input: opts.input, parameters }),
    });
    const text = await res.text();
    let taskId: string | undefined;
    try {
      taskId = JSON.parse(text)?.output?.task_id;
    } catch { /* non-JSON error body */ }
    return { res, text, taskId };
  };

  const first = await attempt(opts.model, opts.parameters);
  if (first.res.ok && first.taskId) {
    return {
      ok: true,
      taskId: first.taskId,
      model: opts.model,
      duration: Number(opts.parameters.duration) || 0,
    };
  }
  console.error('[dashscope] wan create failed', opts.model, first.res.status, first.text.slice(0, 400));

  const canFallback =
    opts.model === WAN_LONGFORM_MODEL &&
    !!opts.fallbackModel &&
    first.res.status !== 429;

  if (canFallback) {
    const params: Record<string, unknown> = { ...opts.parameters };
    delete params.ratio;
    params.duration = Math.min(
      Number(opts.parameters.duration) || 5,
      WAN_LEGACY_MAX_DURATION,
    );
    const second = await attempt(opts.fallbackModel!, params);
    if (second.res.ok && second.taskId) {
      console.warn('[dashscope] fell back to', opts.fallbackModel);
      return {
        ok: true,
        taskId: second.taskId,
        model: opts.fallbackModel!,
        duration: Number(params.duration) || 0,
      };
    }
    return { ok: false, status: second.res.status, detail: second.text };
  }

  return { ok: false, status: first.res.status, detail: first.text };
}


export interface DashScopeAsyncCreateResponse {
  output?: { task_id?: string; task_status?: string };
  request_id?: string;
  code?: string;
  message?: string;
}

export interface DashScopeAsyncResultResponse {
  output?: {
    task_id?: string;
    task_status?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    results?: Array<{ url?: string; video_url?: string }>;
    video_url?: string;
    message?: string;
    code?: string;
  };
  code?: string;
  message?: string;
}

/**
 * Validate JWT in code (signing-keys flow) and return the user id.
 * Returns null if invalid.
 */
export async function getUserIdFromAuth(
  req: Request,
  createClient: (url: string, key: string, opts?: any) => any
): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return null;

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

/**
 * Convert raw provider errors into a short, user-friendly message.
 * Never leaks provider names, URLs, signatures, or raw JSON to clients.
 */
export function friendlyFailureReason(raw: unknown): string {
  const text = String(raw ?? '');
  const t = text.toLowerCase();

  if (!text) return 'Automatic generation failed. Please try again.';
  if (t.includes('resolution must be at least') || (t.includes('resolution') && t.includes('at least'))) {
    return 'The reference image is too small. Please upload a larger image (at least 240x240) and try again.';
  }
  if (t.includes('can not read image') || t.includes('cannot read image') || t.includes('invalid image')) {
    return 'The reference image could not be read. Please re-upload it and try again.';
  }
  if (t.includes('datainspection') || t.includes('green net') || t.includes('inappropriate')) {
    return "Blocked by the content safety filter. Try rewording your prompt or removing sensitive imagery.";
  }
  if (t.includes('inputdatalengthexceeded') || (t.includes('prompt') && t.includes('too long'))) {
    return 'The prompt is too long for this model. Please shorten it and try again.';
  }
  if (t.includes('invalidapikey') || t.includes('api key')) {
    return 'Generation service is temporarily unavailable. Please contact support.';
  }
  if (t.includes('throttling') || t.includes('rate limit') || t.includes('429')) {
    return 'The generation service is busy right now. Please try again in a minute.';
  }
  if (t.includes('timeout') || t.includes('timed out')) {
    return 'Generation timed out. Please try again.';
  }
  if (t.includes('no video url') || t.includes('no result')) {
    return 'Generation finished without a result. Please try again.';
  }
  // Default: short generic message, raw provider detail stays server-side.
  return 'Automatic generation failed. Please try again.';
}

export function genericError(status: number, message = 'Request failed') {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
