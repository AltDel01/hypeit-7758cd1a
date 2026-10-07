import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { admin, encrypt, requireUser, GRAPH, TIKTOK_API } from '../_shared/social.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Sign in required' }, 401);
    const { code, state } = await req.json().catch(() => ({}));
    if (typeof code !== 'string' || typeof state !== 'string' || code.length > 2000 || state.length > 200) {
      return json({ error: 'Invalid request' }, 400);
    }
    const db = admin();
    const { data: st } = await db.from('social_oauth_states').select('*').eq('state', state).maybeSingle();
    await db.from('social_oauth_states').delete().eq('state', state);
    if (!st || st.user_id !== user.id || Date.now() - new Date(st.created_at).getTime() > 3600_000) {
      return json({ error: 'Connection expired, please try again' }, 400);
    }
    const now = new Date().toISOString();

    if (st.provider === 'tiktok') {
      const res = await fetch(`${TIKTOK_API}/v2/oauth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: Deno.env.get('TIKTOK_CLIENT_KEY')!, client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
          code, grant_type: 'authorization_code', redirect_uri: st.redirect_uri,
        }),
      });
      const t = await res.json();
      if (!res.ok || !t.access_token) {
        console.error('tiktok token exchange failed', res.status, JSON.stringify(t));
        return json({ error: 'Could not connect TikTok' }, 400);
      }
      const info = await fetch(`${TIKTOK_API}/v2/user/info/?fields=open_id,display_name,avatar_url`, {
        headers: { Authorization: `Bearer ${t.access_token}` },
      }).then((r) => r.json()).catch(() => ({}));
      const u = info?.data?.user ?? {};
      await db.from('social_connections').upsert({
        user_id: user.id, platform: 'tiktok', account_id: t.open_id ?? u.open_id ?? 'tiktok',
        account_name: u.display_name ?? 'TikTok account', avatar_url: u.avatar_url ?? null,
        access_token_ciphertext: await encrypt(t.access_token),
        refresh_token_ciphertext: t.refresh_token ? await encrypt(t.refresh_token) : null,
        expires_at: new Date(Date.now() + (t.expires_in ?? 86400) * 1000).toISOString(),
        refresh_expires_at: t.refresh_expires_in ? new Date(Date.now() + t.refresh_expires_in * 1000).toISOString() : null,
        updated_at: now,
      }, { onConflict: 'user_id,platform' });
      return json({ ok: true, connected: ['tiktok'] });
    }

    // Meta: code -> short token -> long-lived token -> page tokens (non-expiring)
    const appId = Deno.env.get('META_APP_ID')!;
    const secret = Deno.env.get('META_APP_SECRET')!;
    const short = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
      client_id: appId, client_secret: secret, redirect_uri: st.redirect_uri, code,
    })).then((r) => r.json());
    if (!short.access_token) {
      console.error('meta token exchange failed', JSON.stringify(short));
      return json({ error: 'Could not connect Meta' }, 400);
    }
    const long = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token', client_id: appId, client_secret: secret, fb_exchange_token: short.access_token,
    })).then((r) => r.json());
    const userToken = long.access_token ?? short.access_token;
    const pages = await fetch(`${GRAPH}/me/accounts?` + new URLSearchParams({
      fields: 'id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}',
      access_token: userToken,
    })).then((r) => r.json());
    const list: any[] = pages?.data ?? [];
    if (!list.length) return json({ error: 'No Facebook Page found. Create or select a Page during login.' }, 400);
    const page = list.find((p) => p.instagram_business_account) ?? list[0];
    const pageToken = await encrypt(page.access_token);
    const connected = ['facebook'];
    await db.from('social_connections').upsert({
      user_id: user.id, platform: 'facebook', account_id: page.id, account_name: page.name,
      avatar_url: page.picture?.data?.url ?? null, access_token_ciphertext: pageToken, page_id: page.id,
      expires_at: null, updated_at: now,
    }, { onConflict: 'user_id,platform' });
    const ig = page.instagram_business_account;
    if (ig?.id) {
      await db.from('social_connections').upsert({
        user_id: user.id, platform: 'instagram', account_id: ig.id, account_name: ig.username ? `@${ig.username}` : 'Instagram',
        avatar_url: ig.profile_picture_url ?? null, access_token_ciphertext: pageToken, page_id: page.id, ig_user_id: ig.id,
        expires_at: null, updated_at: now,
      }, { onConflict: 'user_id,platform' });
      connected.push('instagram');
    }
    return json({ ok: true, connected, instagramMissing: !ig?.id });
  } catch (e) {
    console.error('social-oauth-callback', e);
    return json({ error: 'Could not finish the connection' }, 500);
  }
});
