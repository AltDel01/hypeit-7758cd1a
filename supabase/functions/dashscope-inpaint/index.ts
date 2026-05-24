/**
 * dashscope-inpaint: mask-based image inpainting / erase via Alibaba
 * DashScope wanx2.1-imageedit (function: description_edit_with_mask).
 *
 * Async task: create → poll → download → upload to "Generated Images".
 * On any failure: marks auto_failed=true so the manual editor queue
 * picks the row up automatically.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  DASHSCOPE_BASE,
  authHeaders,
  asyncAuthHeaders,
  getUserIdFromAuth,
  genericError,
  ok,
} from '../_shared/dashscope.ts';

interface RequestBody {
  requestId: string;
  prompt: string;
  model?: string; // default: wanx2.1-imageedit
  baseImageUrl?: string;  // storage:bucket/path OR https URL
  maskImageUrl?: string;  // storage:bucket/path OR https URL
}

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 60; // ~4 minutes max

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const userId = await getUserIdFromAuth(req, createClient);
  if (!userId) return genericError(401, 'Unauthorized');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return genericError(400, 'Invalid JSON');
  }

  if (!body.requestId || !body.prompt || !body.baseImageUrl || !body.maskImageUrl) {
    return genericError(400, 'Missing required fields');
  }
  if (body.prompt.length > 4000) return genericError(400, 'Prompt too long');

  const model = body.model || 'wanx2.1-imageedit';

  // Verify ownership
  const { data: reqRow, error: reqErr } = await admin
    .from('generation_requests')
    .select('id, user_id, status')
    .eq('id', body.requestId)
    .maybeSingle();
  if (reqErr || !reqRow || reqRow.user_id !== userId) {
    return genericError(404, 'Request not found');
  }

  // Resolve storage refs → signed URLs
  const resolveUrl = async (u: string): Promise<string | undefined> => {
    if (!u.startsWith('storage:')) return u;
    const rest = u.slice('storage:'.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return undefined;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) {
      console.error('[dashscope-inpaint] sign url failed', bucket, path, error);
      return undefined;
    }
    return data.signedUrl;
  };

  const baseUrl = await resolveUrl(body.baseImageUrl);
  const maskUrl = await resolveUrl(body.maskImageUrl);
  if (!baseUrl || !maskUrl) {
    await markFailed(admin, body.requestId, model);
    return genericError(400, 'Could not resolve images');
  }

  try {
    // 1. Create async task
    const payload = {
      model,
      input: {
        prompt: body.prompt || 'remove the masked area, fill with surrounding background',
        function: 'description_edit_with_mask',
        base_image_url: baseUrl,
        mask_image_url: maskUrl,
      },
      parameters: {
        n: 1,
      },
    };

    const createRes = await fetch(
      `${DASHSCOPE_BASE}/api/v1/services/aigc/image2image/image-synthesis`,
      {
        method: 'POST',
        headers: asyncAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    if (!createRes.ok) {
      const txt = await createRes.text();
      console.error('[dashscope-inpaint] create failed', createRes.status, txt);
      await markFailed(admin, body.requestId, model);
      return genericError(502, 'Inpaint failed, an editor will take over');
    }

    const createJson = await createRes.json();
    const taskId: string | undefined = createJson?.output?.task_id;
    if (!taskId) {
      console.error('[dashscope-inpaint] no task_id', JSON.stringify(createJson).slice(0, 500));
      await markFailed(admin, body.requestId, model);
      return genericError(502, 'Inpaint failed, an editor will take over');
    }

    // Persist task id for visibility
    await admin
      .from('generation_requests')
      .update({ provider_task_id: taskId, auto_provider: 'qwen', auto_model: model })
      .eq('id', body.requestId);

    // 2. Poll
    let resultImageUrl: string | undefined;
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const pollRes = await fetch(`${DASHSCOPE_BASE}/api/v1/tasks/${taskId}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (!pollRes.ok) {
        console.error('[dashscope-inpaint] poll failed', pollRes.status);
        continue;
      }
      const pollJson = await pollRes.json();
      const status: string | undefined = pollJson?.output?.task_status;

      if (status === 'SUCCEEDED') {
        resultImageUrl =
          pollJson?.output?.results?.[0]?.url ||
          pollJson?.output?.results?.[0]?.image_url;
        break;
      }
      if (status === 'FAILED' || status === 'UNKNOWN') {
        console.error('[dashscope-inpaint] task failed', JSON.stringify(pollJson).slice(0, 500));
        await markFailed(admin, body.requestId, model);
        return genericError(502, 'Inpaint failed, an editor will take over');
      }
    }

    if (!resultImageUrl) {
      console.error('[dashscope-inpaint] timed out waiting for result');
      await markFailed(admin, body.requestId, model);
      return genericError(504, 'Inpaint timed out, an editor will take over');
    }

    // 3. Download + store
    let storedUrl = resultImageUrl;
    try {
      const imgRes = await fetch(resultImageUrl);
      if (imgRes.ok) {
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        const path = `${userId}/${body.requestId}.png`;
        const { error: upErr } = await admin.storage
          .from('Generated Images')
          .upload(path, buf, { contentType: 'image/png', upsert: true });
        if (!upErr) {
          storedUrl = `storage:Generated Images/${path}`;
        } else {
          console.error('[dashscope-inpaint] storage upload failed', upErr);
        }
      }
    } catch (e) {
      console.error('[dashscope-inpaint] storage download failed', e);
    }

    const { error: updErr } = await admin
      .from('generation_requests')
      .update({
        status: 'completed',
        result_url: storedUrl,
        completed_at: new Date().toISOString(),
        auto_provider: 'qwen',
        auto_model: model,
        auto_failed: false,
      })
      .eq('id', body.requestId);

    if (updErr) {
      console.error('[dashscope-inpaint] update failed', updErr);
      return genericError(500, 'Internal error');
    }

    return ok({ ok: true, requestId: body.requestId });
  } catch (e) {
    console.error('[dashscope-inpaint] exception', e);
    await markFailed(admin, body.requestId, model);
    return genericError(502, 'Inpaint failed, an editor will take over');
  }
});

async function markFailed(admin: any, requestId: string, model: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'qwen',
      auto_model: model,
      auto_failed: true,
      status: 'new',
    })
    .eq('id', requestId);
}
