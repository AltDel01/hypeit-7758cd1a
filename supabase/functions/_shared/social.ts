/**
 * Social posting helpers (TikTok + Meta). Server-only.
 * Tokens are stored AES-GCM encrypted with a key derived from SOCIAL_TOKEN_SECRET.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

export const GRAPH = 'https://graph.facebook.com/v21.0';
export const TIKTOK_API = 'https://open.tiktokapis.com';
export type Platform = 'tiktok' | 'instagram' | 'facebook';

export function admin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

export async function requireUser(req: Request) {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

async function key(): Promise<CryptoKey> {
  const raw = Deno.env.get('SOCIAL_TOKEN_SECRET');
  if (!raw) throw new Error('SOCIAL_TOKEN_SECRET is not set');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encrypt(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), new TextEncoder().encode(plain)));
  const buf = new Uint8Array(iv.length + ct.length);
  buf.set(iv);
  buf.set(ct, iv.length);
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s);
}

export async function decrypt(stored: string): Promise<string> {
  const buf = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.subarray(0, 12) }, await key(), buf.subarray(12));
  return new TextDecoder().decode(pt);
}

/** Resolve `storage:bucket/path` (or plain URL) to a publicly fetchable URL. */
export async function publicMediaUrl(raw: string): Promise<string> {
  if (!raw.startsWith('storage:')) return raw;
  const rest = raw.slice('storage:'.length);
  const i = rest.indexOf('/');
  const { data, error } = await admin().storage.from(rest.slice(0, i)).createSignedUrl(rest.slice(i + 1), 60 * 60 * 24);
  if (error || !data?.signedUrl) throw new Error('Could not prepare media file');
  return data.signedUrl;
}

/* ---------------- TikTok token refresh ---------------- */
async function tiktokAccessToken(conn: any): Promise<string> {
  const exp = conn.expires_at ? new Date(conn.expires_at).getTime() : 0;
  if (exp - Date.now() > 5 * 60 * 1000) return decrypt(conn.access_token_ciphertext);
  if (!conn.refresh_token_ciphertext) throw new Error('TikTok session expired, reconnect your account');
  const res = await fetch(`${TIKTOK_API}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: Deno.env.get('TIKTOK_CLIENT_KEY')!,
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
      refresh_token: await decrypt(conn.refresh_token_ciphertext),
    }),
  });
  const j = await res.json();
  if (!res.ok || !j.access_token) {
    console.error('tiktok refresh failed', res.status, JSON.stringify(j));
    throw new Error('TikTok session expired, reconnect your account');
  }
  await admin().from('social_connections').update({
    access_token_ciphertext: await encrypt(j.access_token),
    refresh_token_ciphertext: j.refresh_token ? await encrypt(j.refresh_token) : conn.refresh_token_ciphertext,
    expires_at: new Date(Date.now() + j.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', conn.id);
  return j.access_token;
}

export type PublishResult = { status: 'posted' | 'processing' | 'failed'; url?: string; id?: string; container_id?: string; error?: string };

/* ---------------- Publishers ---------------- */
async function publishTikTok(conn: any, mediaUrl: string, assetType: string, caption: string): Promise<PublishResult> {
  if (assetType !== 'video') return { status: 'failed', error: 'TikTok posting supports videos only' };
  const token = await tiktokAccessToken(conn);
  const file = await fetch(mediaUrl);
  if (!file.ok) return { status: 'failed', error: 'Could not read the video file' };
  const bytes = new Uint8Array(await file.arrayBuffer());

  const audited = Deno.env.get('TIKTOK_APP_AUDITED') === 'true';
  const init = await fetch(`${TIKTOK_API}/v2/post/publish/video/init/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      post_info: { title: caption.slice(0, 2200), privacy_level: audited ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY' },
      source_info: { source: 'FILE_UPLOAD', video_size: bytes.length, chunk_size: bytes.length, total_chunk_count: 1 },
    }),
  });
  const ij = await init.json();
  if (!init.ok || ij?.error?.code !== 'ok') {
    console.error('tiktok init failed', init.status, JSON.stringify(ij));
    return { status: 'failed', error: 'TikTok did not accept the post' };
  }
  const up = await fetch(ij.data.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Range': `bytes 0-${bytes.length - 1}/${bytes.length}` },
    body: bytes,
  });
  if (!up.ok) {
    console.error('tiktok upload failed', up.status, await up.text());
    return { status: 'failed', error: 'Video upload to TikTok failed' };
  }
  return { status: 'posted', id: ij.data.publish_id, url: 'https://www.tiktok.com/' };
}

async function igCheckAndPublish(conn: any, token: string, containerId: string): Promise<PublishResult> {
  const s = await fetch(`${GRAPH}/${containerId}?fields=status_code&access_token=${token}`).then((r) => r.json());
  if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
    console.error('ig container error', JSON.stringify(s));
    return { status: 'failed', error: 'Instagram could not process the media' };
  }
  if (s.status_code !== 'FINISHED') return { status: 'processing', container_id: containerId };
  const pub = await fetch(`${GRAPH}/${conn.ig_user_id}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({ creation_id: containerId, access_token: token }),
  }).then((r) => r.json());
  if (!pub.id) {
    console.error('ig publish failed', JSON.stringify(pub));
    return { status: 'failed', error: 'Instagram did not publish the post' };
  }
  const info = await fetch(`${GRAPH}/${pub.id}?fields=permalink&access_token=${token}`).then((r) => r.json());
  return { status: 'posted', id: pub.id, url: info.permalink };
}

async function publishInstagram(conn: any, mediaUrl: string, assetType: string, caption: string): Promise<PublishResult> {
  const token = await decrypt(conn.access_token_ciphertext);
  const params: Record<string, string> = { caption, access_token: token };
  if (assetType === 'video') { params.media_type = 'REELS'; params.video_url = mediaUrl; }
  else params.image_url = mediaUrl;
  const c = await fetch(`${GRAPH}/${conn.ig_user_id}/media`, { method: 'POST', body: new URLSearchParams(params) }).then((r) => r.json());
  if (!c.id) {
    console.error('ig container failed', JSON.stringify(c));
    return { status: 'failed', error: 'Instagram did not accept the post' };
  }
  for (let i = 0; i < 8; i++) {
    const r = await igCheckAndPublish(conn, token, c.id);
    if (r.status !== 'processing') return r;
    await new Promise((res) => setTimeout(res, 5000));
  }
  return { status: 'processing', container_id: c.id };
}

async function publishFacebook(conn: any, mediaUrl: string, assetType: string, caption: string): Promise<PublishResult> {
  const token = await decrypt(conn.access_token_ciphertext);
  const isVideo = assetType === 'video';
  const r = await fetch(`${GRAPH}/${conn.page_id}/${isVideo ? 'videos' : 'photos'}`, {
    method: 'POST',
    body: new URLSearchParams(isVideo
      ? { file_url: mediaUrl, description: caption, access_token: token }
      : { url: mediaUrl, caption, access_token: token }),
  }).then((res) => res.json());
  const id = r.post_id || r.id;
  if (!id) {
    console.error('fb publish failed', JSON.stringify(r));
    return { status: 'failed', error: 'Facebook did not accept the post' };
  }
  return { status: 'posted', id, url: `https://www.facebook.com/${id}` };
}

/** Publish one creative_posts row to all its selected platforms and persist results. */
export async function publishPost(postId: string): Promise<{ status: string; results: Record<string, PublishResult> }> {
  const db = admin();
  const { data: post } = await db.from('creative_posts').select('*').eq('id', postId).maybeSingle();
  if (!post) throw new Error('Post not found');
  const prev: Record<string, PublishResult> = post.publish_results || {};
  const targets = (Object.entries(post.platforms || {}) as [Platform, boolean][]).filter(([, on]) => on).map(([p]) => p);
  await db.from('creative_posts').update({ status: 'posting', post_error: null }).eq('id', postId);

  const { data: conns } = await db.from('social_connections').select('*').eq('user_id', post.user_id);
  const byPlatform = new Map((conns || []).map((c: any) => [c.platform, c]));
  const caption = [post.hook, post.body].filter(Boolean).join('\n\n').slice(0, 2100);
  let mediaUrl = '';
  try { mediaUrl = post.asset_url ? await publicMediaUrl(post.asset_url) : ''; } catch { /* handled below */ }

  const results: Record<string, PublishResult> = { ...prev };
  for (const p of targets) {
    if (prev[p]?.status === 'posted') continue;
    const conn = byPlatform.get(p);
    if (!conn) { results[p] = { status: 'failed', error: 'Account not connected' }; continue; }
    if (!mediaUrl) { results[p] = { status: 'failed', error: 'No media to post' }; continue; }
    try {
      if (p === 'instagram' && prev[p]?.status === 'processing' && prev[p]?.container_id) {
        results[p] = await igCheckAndPublish(conn, await decrypt(conn.access_token_ciphertext), prev[p].container_id!);
      } else if (p === 'tiktok') results[p] = await publishTikTok(conn, mediaUrl, post.asset_type, caption);
      else if (p === 'instagram') results[p] = await publishInstagram(conn, mediaUrl, post.asset_type, caption);
      else results[p] = await publishFacebook(conn, mediaUrl, post.asset_type, caption);
    } catch (e) {
      console.error(`publish ${p} error`, e);
      results[p] = { status: 'failed', error: e instanceof Error && e.message.includes('reconnect') ? e.message : 'Posting failed, please try again' };
    }
  }
  const vals = targets.map((p) => results[p]?.status);
  const status = vals.some((v) => v === 'processing') ? 'posting' : vals.every((v) => v === 'posted') ? 'posted' : 'failed';
  const errs = targets.filter((p) => results[p]?.status === 'failed').map((p) => `${p}: ${results[p].error}`);
  await db.from('creative_posts').update({
    status, publish_results: results, post_error: errs.length ? errs.join('; ') : null, updated_at: new Date().toISOString(),
  }).eq('id', postId);
  return { status, results };
}
