import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DASHSCOPE_BASE, authHeaders, corsHeaders } from '../_shared/dashscope.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  if (!taskId) return new Response('missing taskId', { status: 400, headers: corsHeaders });
  const upstream = await fetch(`${DASHSCOPE_BASE}/api/v1/tasks/${taskId}`, {
    headers: authHeaders(),
  });
  const txt = await upstream.text();
  return new Response(JSON.stringify({ status: upstream.status, body: txt }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
