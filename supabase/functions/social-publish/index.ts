import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { admin, publishPost, requireUser } from '../_shared/social.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// body: { postId, scheduledAt?: ISO string }  — scheduledAt in the future queues it instead.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Sign in required' }, 401);
    const { postId, scheduledAt } = await req.json().catch(() => ({}));
    if (typeof postId !== 'string' || !/^[0-9a-f-]{36}$/i.test(postId)) return json({ error: 'Invalid request' }, 400);
    const db = admin();
    const { data: post } = await db.from('creative_posts').select('id, user_id').eq('id', postId).maybeSingle();
    if (!post || post.user_id !== user.id) return json({ error: 'Not found' }, 404);

    if (scheduledAt) {
      const t = new Date(scheduledAt);
      if (isNaN(t.getTime())) return json({ error: 'Invalid date' }, 400);
      if (t.getTime() > Date.now() + 60_000) {
        await db.from('creative_posts').update({ status: 'scheduled', scheduled_at: t.toISOString(), post_error: null }).eq('id', postId);
        return json({ status: 'scheduled', scheduledAt: t.toISOString() });
      }
    }
    const r = await publishPost(postId);
    return json(r);
  } catch (e) {
    console.error('social-publish', e);
    return json({ error: 'Posting failed, please try again' }, 500);
  }
});
