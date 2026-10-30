/**
 * Shared BytePlus ModelArk helpers for image (Seedream) and video (Seedance)
 * generation. Model IDs live here so they can be swapped in one place.
 */
import { DASHSCOPE_BASE, authHeaders as dashscopeHeaders, friendlyFailureReason } from './dashscope.ts';

export const ARK_BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3';
export const ARK_IMAGE_MODEL = Deno.env.get('ARK_IMAGE_MODEL') || 'dola-seedream-5-0-pro-260628';
export const ARK_VIDEO_MODEL = Deno.env.get('ARK_VIDEO_MODEL') || 'dreamina-seedance-2-5-260628';
export const ARK_PROVIDER = 'modelark';

/** Seedance 2.5 accepts up to 30 seconds (verified: 30 accepted, 60 rejected). */
export const ARK_MIN_DURATION = 4;
export const ARK_MAX_DURATION = 30;
export const ARK_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];

export function arkHeaders(): Record<string, string> {
  const key = Deno.env.get('ARK_API_KEY');
  if (!key) throw new Error('ARK_API_KEY not configured');
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

/** -1 (or "smart") lets Seedance pick the length that fits the story. */
export const ARK_SMART_DURATION = -1;
export function isSmart(raw: unknown): boolean {
  const r = String(raw ?? '').trim().toLowerCase();
  return r === 'smart' || r === 'adaptive' || r === 'auto' || r === '-1';
}

export function clampArkDuration(raw: unknown, fallback = 5): number {
  if (isSmart(raw)) return ARK_SMART_DURATION;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(ARK_MIN_DURATION, Math.min(ARK_MAX_DURATION, Math.round(n)));
}

export function normalizeArkResolution(raw: unknown): '480p' | '720p' | '1080p' {
  const r = String(raw ?? '').toLowerCase();
  if (r.startsWith('480')) return '480p';
  if (r.startsWith('720')) return '720p';
  return '1080p';
}

export function normalizeArkRatio(raw: unknown): string {
  const r = String(raw ?? '').trim();
  if (isSmart(r)) return 'adaptive';
  if (ARK_RATIOS.includes(r)) return r;
  const m = r.match(/^(\d+)\s*[*x:]\s*(\d+)$/i);
  if (m) {
    const w = Number(m[1]), h = Number(m[2]);
    const v = w / h;
    let best = '16:9', diff = Infinity;
    for (const c of ARK_RATIOS) {
      const [a, b] = c.split(':').map(Number);
      const d = Math.abs(a / b - v);
      if (d < diff) { diff = d; best = c; }
    }
    return best;
  }
  return '16:9';
}

/** Map a requested aspect ratio to a Seedream pixel size. */
export function arkImageSize(raw: unknown): string {
  const s = String(raw ?? '').trim();
  // A quality level alone ('2K') lets Seedream choose the shape from the prompt.
  if (isSmart(s)) return '2K';
  const m = s.match(/^(\d+)\s*[*x]\s*(\d+)$/i);
  if (m) {
    const w = Number(m[1]), h = Number(m[2]);
    // Seedream needs a reasonably large canvas; scale small sizes up.
    const scale = Math.max(1, Math.sqrt((1920 * 1920) / (w * h)));
    const round = (n: number) => Math.round((n * scale) / 64) * 64;
    return `${round(w)}x${round(h)}`;
  }
  const map: Record<string, string> = {
    '1:1': '2048x2048', '16:9': '2560x1440', '9:16': '1440x2560',
    '4:3': '2304x1728', '3:4': '1728x2304', '21:9': '3024x1296',
  };
  return map[s] || '2K';
}

export function bytesToDataUrl(bytes: Uint8Array, contentType: string): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${contentType || 'image/jpeg'};base64,${btoa(bin)}`;
}

/**
 * Generate images with Seedream. `images` are reference/edit inputs
 * (https URLs or data URLs). Returns result image URLs.
 */
export async function arkGenerateImages(opts: {
  prompt: string;
  size?: string;
  images?: string[];
  n?: number;
}): Promise<{ ok: true; urls: string[] } | { ok: false; status: number; detail: string }> {
  const n = Math.max(1, Math.min(4, opts.n ?? 1));
  const body: Record<string, unknown> = {
    model: ARK_IMAGE_MODEL,
    prompt: opts.prompt,
    size: opts.size || '2K',
    response_format: 'url',
    watermark: false,
  };
  if (opts.images?.length) body.image = opts.images.length === 1 ? opts.images[0] : opts.images.slice(0, 10);
  if (n > 1) {
    body.sequential_image_generation = 'auto';
    body.sequential_image_generation_options = { max_images: n };
  }
  const res = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST', headers: arkHeaders(), body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error('[modelark] image failed', res.status, text.slice(0, 400));
    return { ok: false, status: res.status, detail: text };
  }
  try {
    const urls = (JSON.parse(text)?.data ?? []).map((d: any) => d?.url).filter(Boolean);
    if (!urls.length) return { ok: false, status: 502, detail: 'no result' };
    return { ok: true, urls };
  } catch {
    return { ok: false, status: 502, detail: 'no result' };
  }
}

export type ArkMediaRole = 'first_frame' | 'last_frame' | 'reference_image';

/** Seedance refuses input images it thinks show a real person (privacy filter). */
export function isArkRealPersonError(detail: unknown): boolean {
  const t = String(detail ?? '').toLowerCase();
  return t.includes('privacyinformation') || t.includes('real person');
}

/**
 * Seedream prompt that rebuilds a reference so Seedance accepts it: product
 * references become product-only shots; frames keep the scene but any real
 * person is replaced with a clearly different, fictional AI-generated person.
 */
export function arkSafeReferencePrompt(role: ArkMediaRole): string {
  if (role === 'reference_image') {
    return 'Recreate the product from the reference image as a clean, high quality studio product photo. ' +
      'Keep the product exactly the same: shape, colors, packaging, logo and label text. ' +
      'Remove every person, face, hand and body part. Product only, neutral premium background, soft lighting.';
  }
  return 'Recreate this image with the same composition, setting, lighting, colors and products. ' +
    'Replace every real person with a clearly different fictional AI-generated person (different face), ' +
    'same pose, clothing style and framing. Keep any product, packaging and label exactly the same.';
}

/** Submit a Seedance video task. Returns the task id. */
export async function arkCreateVideoTask(opts: {
  prompt: string;
  duration: number;
  resolution?: unknown;
  ratio?: unknown;
  images?: Array<{ url: string; role: ArkMediaRole }>;
  generateAudio?: boolean;
}): Promise<{ ok: true; taskId: string; model: string; duration: number } | { ok: false; status: number; detail: string }> {
  const duration = clampArkDuration(opts.duration);
  const content: any[] = [{ type: 'text', text: opts.prompt || 'A cinematic video' }];
  for (const img of opts.images ?? []) {
    content.push({ type: 'image_url', image_url: { url: img.url }, role: img.role });
  }
  const hasFirst = (opts.images ?? []).some((i) => i.role === 'first_frame');
  const body: Record<string, unknown> = {
    model: ARK_VIDEO_MODEL,
    content,
    duration,
    resolution: normalizeArkResolution(opts.resolution),
    watermark: false,
    generate_audio: opts.generateAudio ?? true,
  };
  // With a first frame the clip keeps the image's own shape.
  body.ratio = hasFirst ? 'adaptive' : normalizeArkRatio(opts.ratio);
  const res = await fetch(`${ARK_BASE}/contents/generations/tasks`, {
    method: 'POST', headers: arkHeaders(), body: JSON.stringify(body),
  });
  const text = await res.text();
  let taskId: string | undefined;
  try { taskId = JSON.parse(text)?.id; } catch { /* ignore */ }
  if (!res.ok || !taskId) {
    console.error('[modelark] video create failed', res.status, text.slice(0, 400));
    return { ok: false, status: res.status, detail: text };
  }
  return { ok: true, taskId, model: ARK_VIDEO_MODEL, duration };
}

export type VideoPoll =
  | { state: 'pending' }
  | { state: 'failed'; reason: string }
  | { state: 'succeeded'; videoUrl?: string };

/**
 * Cancel a ModelArk video task. ModelArk only allows this while the task is
 * still queued; once running it cannot be stopped.
 */
export async function arkCancelVideoTask(taskId: string): Promise<'cancelled' | 'running' | 'error'> {
  const r = await fetch(`${ARK_BASE}/contents/generations/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE', headers: arkHeaders(),
  });
  if (r.ok) return 'cancelled';
  const t = await r.text();
  if (t.includes('RunningTaskDeletion')) return 'running';
  console.error('[modelark] cancel failed', r.status, t.slice(0, 300));
  return 'error';
}

/** Poll a video task for either provider ('modelark' or legacy 'wan'). */
export async function pollVideoTask(provider: string | null | undefined, taskId: string): Promise<VideoPoll | null> {
  if (provider === ARK_PROVIDER) {
    const r = await fetch(`${ARK_BASE}/contents/generations/tasks/${taskId}`, { headers: arkHeaders() });
    if (!r.ok) {
      console.error('[modelark] poll error', r.status, (await r.text()).slice(0, 300));
      return null;
    }
    const j = await r.json();
    const s = String(j?.status || '').toLowerCase();
    if (s === 'queued' || s === 'running') return { state: 'pending' };
    if (s === 'succeeded') return { state: 'succeeded', videoUrl: j?.content?.video_url };
    const err = j?.error ? `${j.error.code || ''} ${j.error.message || ''}` : s;
    if (s === 'cancelled') return { state: 'failed', reason: 'This generation was cancelled.' };
    if (s === 'expired') return { state: 'failed', reason: 'Generation timed out. Please try again.' };
    return { state: 'failed', reason: friendlyFailureReason(err) };
  }
  // Legacy Alibaba tasks still in flight.
  const r = await fetch(`${DASHSCOPE_BASE}/api/v1/tasks/${taskId}`, { headers: dashscopeHeaders() });
  if (!r.ok) return null;
  const j = await r.json();
  const s = j?.output?.task_status || 'UNKNOWN';
  if (s === 'PENDING' || s === 'RUNNING') return { state: 'pending' };
  if (s === 'SUCCEEDED') {
    return { state: 'succeeded', videoUrl: j?.output?.video_url || j?.output?.results?.[0]?.video_url || j?.output?.results?.[0]?.url };
  }
  if (s === 'UNKNOWN') return { state: 'failed', reason: 'Generation was interrupted. Please try again.' };
  return { state: 'failed', reason: friendlyFailureReason(`${j?.output?.code || ''} ${j?.output?.message || ''}`) };
}

const STYLE_TEXT: Record<string, string> = {
  'cinematic': 'cinematic film look, shallow depth of field, rich contrast, film grain',
  'vintage': 'vintage retro film look, warm faded colors, soft grain',
  'anime': 'Japanese anime art style, cel shading, clean line art',
  'documentary': 'documentary realism, natural light, observational framing',
  'commercial': 'polished commercial advertising look, bright clean lighting, crisp detail',
  'music video': 'stylish music video look, bold colors, rhythmic cutting',
  'horror': 'dark horror atmosphere, low key lighting, eerie mood',
  'sci-fi': 'science fiction look, futuristic lighting, neon accents',
};
const CAMERA_TEXT: Record<string, string> = {
  'static': 'locked-off static camera, the camera does not move',
  'pan': 'smooth horizontal camera pan',
  'zoom in': 'camera slowly zooms in',
  'zoom out': 'camera slowly zooms out',
  'tracking': 'tracking shot, camera follows the subject',
  'crane': 'crane shot, camera rises smoothly',
  'handheld': 'handheld camera with natural slight shake',
  'dolly': 'dolly shot, camera glides toward the subject',
};
const INTENSITY_TEXT: Record<string, string> = {
  'subtle': 'subtle, gentle movement',
  'moderate': 'moderate, natural movement',
  'dynamic': 'dynamic, energetic movement',
};

/**
 * Turn the composer's "[Style: X | Camera: Y | Motion intensity: Z]" block into
 * plain directions Seedance follows (it reads natural language, not tags).
 */
export function seedanceDirections(prompt: string): string {
  return prompt.replace(/\[([^\]]*(?:Style|Camera|Motion intensity)\s*:[^\]]*)\]/i, (_m, inner: string) => {
    const parts: string[] = [];
    for (const seg of inner.split('|')) {
      const [k, ...rest] = seg.split(':');
      const key = (k || '').trim().toLowerCase();
      const val = rest.join(':').trim();
      const v = val.toLowerCase();
      if (!val) continue;
      if (key === 'style') parts.push(`Visual style: ${STYLE_TEXT[v] || val}.`);
      else if (key === 'camera') parts.push(`Camera: ${CAMERA_TEXT[v] || val}.`);
      else if (key === 'motion intensity') parts.push(`Motion: ${INTENSITY_TEXT[v] || val}.`);
    }
    return parts.join(' ');
  }).trim();
}
