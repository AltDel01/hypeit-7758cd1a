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

export async function normalizeImageForWan(
  bytes: Uint8Array,
  contentType: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (!contentType.startsWith('image/')) return { bytes, contentType };

  // Path 1: imagescript (handles png/webp/baseline jpeg)
  try {
    const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
    const img = await Image.decode(bytes);
    if (img.width <= WAN_MAX_SIDE && img.height <= WAN_MAX_SIDE) {
      return { bytes, contentType };
    }
    const scale = Math.min(WAN_MAX_SIDE / img.width, WAN_MAX_SIDE / img.height);
    img.resize(Math.round(img.width * scale), Math.round(img.height * scale));
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
    if (sw <= WAN_MAX_SIDE && sh <= WAN_MAX_SIDE) return { bytes, contentType };
    const scale = Math.min(WAN_MAX_SIDE / sw, WAN_MAX_SIDE / sh);
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
