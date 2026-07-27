/**
 * qwen-image: synchronous image generation OR instruction-based editing
 * via Alibaba DashScope (Qwen-Image-3.0 / Qwen-Image-3.0-Pro).
 *
 * On success: uploads result to "Generated Images" bucket, updates
 * generation_requests with result_url + status='completed'.
 *
 * On failure: sets auto_failed=true, status='new'. The manual editor
 * queue picks the row up automatically.
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
  mode: 'gen' | 'edit';
  prompt: string;
  model: string; // e.g. 'qwen-image-3.0' or 'qwen-image-3.0-pro'
  size?: string; // e.g. '1024*1024'
  n?: number; // number of images to generate (1-4)
  promptExtend?: boolean; // auto-enhance the prompt
  referenceImageUrls?: string[]; // for edit
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

  if (!body.requestId || !body.prompt || !body.model || !body.mode) {
    return genericError(400, 'Missing required fields');
  }
  if (body.prompt.length > 4000) return genericError(400, 'Prompt too long');
  if (body.mode === 'edit' && (!body.referenceImageUrls || body.referenceImageUrls.length === 0)) {
    return genericError(400, 'Edit mode requires at least one reference image');
  }

  // Verify the request belongs to this user
  const { data: reqRow, error: reqErr } = await admin
    .from('generation_requests')
    .select('id, user_id, status')
    .eq('id', body.requestId)
    .maybeSingle();
  if (reqErr || !reqRow || reqRow.user_id !== userId) {
    return genericError(404, 'Request not found');
  }

  // Resolve storage: refs to signed HTTPS URLs DashScope can fetch
  const resolveUrl = async (u: string): Promise<string | undefined> => {
    if (!u.startsWith('storage:')) return u;
    const rest = u.slice('storage:'.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return undefined;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) {
      console.error('[qwen-image] sign url failed', bucket, path, error);
      return undefined;
    }
    return data.signedUrl;
  };

  // Build DashScope payload
  // Multimodal generation endpoint supports both text->image and edit (with image refs)
  const content: any[] = [];
  if (body.mode === 'edit' && body.referenceImageUrls) {
    for (const url of body.referenceImageUrls.slice(0, 3)) {
      const resolved = await resolveUrl(url);
      if (!resolved) {
        await markFailed(admin, body.requestId, body.model, 'Could not resolve reference image');
        return genericError(400, 'Could not resolve reference image');
      }
      content.push({ image: resolved });
    }
  }

  content.push({ text: body.prompt });

  const imageCount = Math.min(4, Math.max(1, Math.floor(body.n ?? 1)));

  const payload = {
    model: body.model,
    input: {
      messages: [{ role: 'user', content }],
    },
    parameters: {
      size: snapSize(body.size),
      n: imageCount,
      prompt_extend: body.promptExtend ?? false,
    },
  };

  try {
    const upstream = await fetch(
      `${DASHSCOPE_BASE}/api/v1/services/aigc/multimodal-generation/generation`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error('[qwen-image] upstream error', upstream.status, txt);
      await markFailed(admin, body.requestId, body.model, humanizeProviderError(upstream.status, txt));
      return genericError(502, 'Generation failed, an editor will take over');
    }

    const json = await upstream.json();
    // Collect all image urls from common response shapes
    const rawUrls: string[] = [];
    const choices = json?.output?.choices;
    if (Array.isArray(choices)) {
      for (const choice of choices) {
        const parts = choice?.message?.content;
        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (part?.image) rawUrls.push(part.image);
          }
        }
      }
    }
    if (Array.isArray(json?.output?.results)) {
      for (const r of json.output.results) {
        if (r?.url) rawUrls.push(r.url);
      }
    }
    if (rawUrls.length === 0 && json?.output?.url) rawUrls.push(json.output.url);

    if (rawUrls.length === 0) {
      console.error('[qwen-image] no image url in response', JSON.stringify(json).slice(0, 500));
      await markFailed(admin, body.requestId, body.model, humanizeProviderError(200, JSON.stringify(json)));
      return genericError(502, 'Generation failed, an editor will take over');
    }

    // Download and upload each image to Supabase Storage
    const storedUrls: string[] = [];
    for (let i = 0; i < rawUrls.length; i++) {
      const imageUrl = rawUrls[i];
      let storedUrl = imageUrl;
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buf = new Uint8Array(await imgRes.arrayBuffer());
          const path = `${userId}/${body.requestId}-${i}.png`;
          const { error: upErr } = await admin.storage
            .from('generated-images')
            .upload(path, buf, { contentType: 'image/png', upsert: true });
          if (!upErr) {
            storedUrl = `storage:generated-images/${path}`;
          } else {
            console.error('[qwen-image] storage upload failed', upErr);
          }
        }
      } catch (e) {
        console.error('[qwen-image] storage download failed', e);
      }
      storedUrls.push(storedUrl);
    }

    const { error: updErr } = await admin
      .from('generation_requests')
      .update({
        status: 'completed',
        result_url: storedUrls[0],
        result_images: storedUrls,
        completed_at: new Date().toISOString(),
        auto_provider: 'qwen',
        auto_model: body.model,
        auto_failed: false,
        failure_reason: null,
      })
      .eq('id', body.requestId);

    if (updErr) {
      console.error('[qwen-image] update failed', updErr);
      return genericError(500, 'Internal error');
    }

    return ok({ ok: true, requestId: body.requestId });
  } catch (e) {
    console.error('[qwen-image] exception', e);
    await markFailed(admin, body.requestId, body.model, 'Network error while contacting provider');
    return genericError(502, 'Generation failed, an editor will take over');
  }
});

/**
 * DashScope Qwen image models accept only these sizes. Anything else is
 * rejected with a 400, so snap to the closest allowed aspect ratio.
 */
const ALLOWED_SIZES: Array<[number, number]> = [
  [1664, 928], [1472, 1104], [1328, 1328], [1104, 1472], [928, 1664],
];

function snapSize(size?: string): string {
  const m = (size || '').match(/^(\d+)\s*\*\s*(\d+)$/);
  if (!m) return '1328*1328';
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!w || !h) return '1328*1328';
  if (ALLOWED_SIZES.some(([aw, ah]) => aw === w && ah === h)) return `${w}*${h}`;
  const target = w / h;
  let best = ALLOWED_SIZES[2];
  let bestDiff = Infinity;
  for (const s of ALLOWED_SIZES) {
    const diff = Math.abs(s[0] / s[1] - target);
    if (diff < bestDiff) { bestDiff = diff; best = s; }
  }
  return `${best[0]}*${best[1]}`;
}

function humanizeProviderError(status: number, raw: string): string {
  const t = (raw || '').toLowerCase();
  if (t.includes('datainspection') || t.includes('green net') || t.includes('inappropriate')) {
    return "Blocked by provider's content safety filter. Try rewording your prompt.";
  }
  if (t.includes('inputdatalengthexceeded') || (t.includes('prompt') && t.includes('length'))) {
    return 'Prompt is too long for this model (max ~4000 chars). Please shorten it.';
  }
  if (t.includes('invalidapikey')) {
    return 'Provider rejected the API key. Please contact support.';
  }
  if (t.includes('model not exist') || t.includes('accessdenied') || t.includes('access denied')) {
    return 'This image model is not available on the provider account. An editor will take over.';
  }
  if (t.includes('throttling') || status === 429) {
    return 'Provider is rate-limiting requests. Please retry in a minute.';
  }
  if (status === 401) {
    return 'Provider rejected the API key. Please contact support.';
  }
  if (status === 403) {
    return 'This image model is not available on the provider account. An editor will take over.';
  }
  if (status >= 500) return 'Provider service is temporarily unavailable.';
  return `Provider error (${status}). An editor will take over.`;
}

async function markFailed(admin: any, requestId: string, model: string, reason?: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'qwen',
      auto_model: model,
      auto_failed: true,
      status: 'new', // ensure manual editor queue picks it up
      failure_reason: reason || 'Automatic generation failed',
    })
    .eq('id', requestId);
}

