/**
 * qwen-image: synchronous image generation OR instruction-based editing
 * via Alibaba DashScope (Qwen-Image-2.0 / Qwen-Image-2.0-Pro).
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
  model: string; // e.g. 'qwen-image-2.0' or 'qwen-image-2.0-pro'
  size?: string; // e.g. '1024*1024'
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

  // Build DashScope payload
  // Multimodal generation endpoint supports both text->image and edit (with image refs)
  const content: any[] = [];
  if (body.mode === 'edit' && body.referenceImageUrls) {
    for (const url of body.referenceImageUrls.slice(0, 3)) {
      content.push({ image: url });
    }
  }
  content.push({ text: body.prompt });

  const payload = {
    model: body.model,
    input: {
      messages: [{ role: 'user', content }],
    },
    parameters: {
      size: body.size || '1024*1024',
      n: 1,
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
      await markFailed(admin, body.requestId, body.model);
      return genericError(502, 'Generation failed, an editor will take over');
    }

    const json = await upstream.json();
    // Try common shapes for image url
    const imageUrl: string | undefined =
      json?.output?.choices?.[0]?.message?.content?.[0]?.image ||
      json?.output?.results?.[0]?.url ||
      json?.output?.url;

    if (!imageUrl) {
      console.error('[qwen-image] no image url in response', JSON.stringify(json).slice(0, 500));
      await markFailed(admin, body.requestId, body.model);
      return genericError(502, 'Generation failed, an editor will take over');
    }

    // Download and upload to Supabase Storage
    let storedUrl = imageUrl;
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        const path = `${userId}/${body.requestId}.png`;
        const { error: upErr } = await admin.storage
          .from('Generated Images')
          .upload(path, buf, { contentType: 'image/png', upsert: true });
        if (!upErr) {
          storedUrl = `storage:Generated Images/${path}`;
        } else {
          console.error('[qwen-image] storage upload failed', upErr);
        }
      }
    } catch (e) {
      console.error('[qwen-image] storage download failed', e);
    }

    const { error: updErr } = await admin
      .from('generation_requests')
      .update({
        status: 'completed',
        result_url: storedUrl,
        completed_at: new Date().toISOString(),
        auto_provider: 'qwen',
        auto_model: body.model,
        auto_failed: false,
      })
      .eq('id', body.requestId);

    if (updErr) {
      console.error('[qwen-image] update failed', updErr);
      return genericError(500, 'Internal error');
    }

    return ok({ ok: true, requestId: body.requestId });
  } catch (e) {
    console.error('[qwen-image] exception', e);
    await markFailed(admin, body.requestId, body.model);
    return genericError(502, 'Generation failed, an editor will take over');
  }
});

async function markFailed(admin: any, requestId: string, model: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'qwen',
      auto_model: model,
      auto_failed: true,
      status: 'new', // ensure manual editor queue picks it up
    })
    .eq('id', requestId);
}
