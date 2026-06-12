/**
 * wan-resubmit (temporary maintenance): re-dispatches stuck wan i2v/r2v
 * requests (auto_failed=true) through the new DashScope OSS upload pipeline.
 * Only touches rows that already failed auto-fulfillment.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  DASHSCOPE_BASE,
  asyncAuthHeaders,
  genericError,
  ok,
  uploadToDashScopeOss,
} from '../_shared/dashscope.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let body: { requestId?: string };
  try {
    body = await req.json();
  } catch {
    return genericError(400, 'Invalid JSON');
  }
  if (!body.requestId) return genericError(400, 'Missing requestId');

  const { data: row } = await admin
    .from('generation_requests')
    .select('id, prompt, category, auto_model, auto_failed, status, reference_image_url, result_url')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!row || row.result_url) return genericError(404, 'Not eligible');
  if (!row.auto_failed) return genericError(400, 'Request did not auto-fail');

  const ref: string | null = row.reference_image_url;
  if (!ref?.startsWith('storage:')) return genericError(400, 'No storage reference');

  const rest = ref.slice('storage:'.length);
  const slash = rest.indexOf('/');
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  const { data: file, error: dlErr } = await admin.storage.from(bucket).download(path);
  if (dlErr || !file) {
    console.error('[wan-resubmit] download failed', dlErr?.message);
    return genericError(500, 'Download failed');
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const model = row.auto_model || 'wan2.7-i2v';
  const ossUrl = await uploadToDashScopeOss(
    model,
    bytes,
    path.split('/').pop() || 'frame.jpg',
    (file as any).type || 'image/jpeg'
  );
  console.log('[wan-resubmit] oss url', ossUrl.slice(0, 100));

  const payload = {
    model,
    input: {
      prompt: row.prompt?.slice(0, 3800) || '',
      media: [{ type: 'first_frame', url: ossUrl }],
    },
    parameters: { resolution: '720P', duration: 5 },
  };

  const upstream = await fetch(
    `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`,
    {
      method: 'POST',
      headers: { ...asyncAuthHeaders(), 'X-DashScope-OssResourceResolve': 'enable' },
      body: JSON.stringify(payload),
    }
  );
  const txt = await upstream.text();
  console.log('[wan-resubmit] upstream', upstream.status, txt.slice(0, 400));
  if (!upstream.ok) return genericError(502, 'Submission failed');

  const json = JSON.parse(txt);
  const taskId = json?.output?.task_id;
  if (!taskId) return genericError(502, 'No task id');

  await admin
    .from('generation_requests')
    .update({
      status: 'in-progress',
      provider_task_id: taskId,
      auto_failed: false,
      auto_provider: 'wan',
      auto_model: model,
    })
    .eq('id', row.id);

  return ok({ ok: true, taskId });
});
