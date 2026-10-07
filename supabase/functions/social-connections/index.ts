import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { admin, requireUser } from '../_shared/social.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// action: "list" | "disconnect" (platform)
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Sign in required' }, 401);
    const { action, platform } = await req.json().catch(() => ({}));
    const db = admin();
    if (action === 'disconnect') {
      if (!['tiktok', 'instagram', 'facebook'].includes(platform)) return json({ error: 'Invalid request' }, 400);
      await db.from('social_connections').delete().eq('user_id', user.id).eq('platform', platform);
      return json({ ok: true });
    }
    const { data } = await db.from('social_connections')
      .select('platform, account_name, avatar_url, updated_at').eq('user_id', user.id);
    return json({
      connections: data ?? [],
      configured: {
        tiktok: !!Deno.env.get('TIKTOK_CLIENT_KEY'),
        meta: !!Deno.env.get('META_APP_ID'),
      },
    });
  } catch (e) {
    console.error('social-connections', e);
    return json({ error: 'Something went wrong' }, 500);
  }
});
