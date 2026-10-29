/**
 * cancel-generation: lets the owner stop a ModelArk video that has not started
 * rendering yet. ModelArk refuses cancellation once a task is running.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, getUserIdFromAuth, genericError, ok } from '../_shared/dashscope.ts';
import { arkCancelVideoTask, ARK_PROVIDER } from '../_shared/modelark.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const userId = await getUserIdFromAuth(req, createClient);
  if (!userId) return genericError(401, 'Unauthorized');

  let requestId = '';
  try { requestId = String((await req.json())?.requestId || ''); } catch { /* ignore */ }
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) return genericError(400, 'Invalid request');

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await admin
    .from('generation_requests')
    .select('id, user_id, status, auto_provider, provider_task_id, result_url')
    .eq('id', requestId)
    .maybeSingle();
  if (!row || row.user_id !== userId) return genericError(404, 'Not found');
  if (row.result_url || !['new', 'in-progress'].includes(row.status)) return ok({ result: 'finished' });

  if (row.auto_provider === ARK_PROVIDER && row.provider_task_id) {
    const r = await arkCancelVideoTask(row.provider_task_id);
    if (r === 'running') return ok({ result: 'running' });
    if (r === 'error') return genericError(502, 'Could not cancel');
  } else if (row.provider_task_id) {
    return ok({ result: 'running' });
  }

  await admin.from('generation_requests')
    .update({ status: 'failed', auto_failed: false, failure_reason: 'Cancelled by you. No credits were used.' })
    .eq('id', requestId);
  return ok({ result: 'cancelled' });
});
