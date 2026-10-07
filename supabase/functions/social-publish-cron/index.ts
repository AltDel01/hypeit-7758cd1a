import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { admin, publishPost } from '../_shared/social.ts';

// Called by pg_cron with the service role key. Publishes due scheduled posts
// and finalizes Instagram posts still processing.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }
  const db = admin();
  const { data: due } = await db.from('creative_posts').select('id')
    .eq('status', 'scheduled').lte('scheduled_at', new Date().toISOString()).limit(20);
  const { data: pending } = await db.from('creative_posts').select('id')
    .eq('status', 'posting').lt('updated_at', new Date(Date.now() - 4 * 60_000).toISOString()).limit(20);
  const ids = [...(due ?? []), ...(pending ?? [])].map((r: any) => r.id);
  let done = 0;
  for (const id of ids) {
    try { await publishPost(id); done++; } catch (e) { console.error('cron publish', id, e); }
  }
  return new Response(JSON.stringify({ processed: done }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
