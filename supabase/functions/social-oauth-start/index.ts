import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { admin, requireUser } from '../_shared/social.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const META_SCOPES = [
  'pages_show_list', 'pages_manage_posts', 'pages_read_engagement', 'business_management',
  'instagram_basic', 'instagram_content_publish',
].join(',');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Sign in required' }, 401);
    const body = await req.json().catch(() => ({}));
    const provider = body.provider;
    let origin: string;
    try { origin = new URL(String(body.origin)).origin; } catch { return json({ error: 'Invalid request' }, 400); }
    if (provider !== 'tiktok' && provider !== 'meta') return json({ error: 'Invalid request' }, 400);

    const redirectUri = `${origin}/oauth/${provider}/callback`;
    const state = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const db = admin();
    await db.from('social_oauth_states').delete().lt('created_at', new Date(Date.now() - 3600_000).toISOString());
    await db.from('social_oauth_states').insert({ state, user_id: user.id, provider, redirect_uri: redirectUri });

    if (provider === 'tiktok') {
      const ck = Deno.env.get('TIKTOK_CLIENT_KEY');
      if (!ck) return json({ error: 'not_configured' }, 503);
      const u = new URL('https://www.tiktok.com/v2/auth/authorize/');
      u.search = new URLSearchParams({
        client_key: ck, scope: 'user.info.basic,video.publish,video.upload',
        response_type: 'code', redirect_uri: redirectUri, state,
      }).toString();
      return json({ authorizationUrl: u.toString() });
    }
    const appId = Deno.env.get('META_APP_ID');
    if (!appId) return json({ error: 'not_configured' }, 503);
    const u = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    u.search = new URLSearchParams({ client_id: appId, redirect_uri: redirectUri, state, scope: META_SCOPES, response_type: 'code' }).toString();
    return json({ authorizationUrl: u.toString() });
  } catch (e) {
    console.error('social-oauth-start', e);
    return json({ error: 'Could not start connection' }, 500);
  }
});
