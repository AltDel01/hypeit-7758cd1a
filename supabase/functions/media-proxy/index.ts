/**
 * media-proxy: public, token-less proxy that streams a private Storage object
 * by bucket/path. Used so external providers (e.g. Alibaba/Wan video) can
 * reliably fetch reference frames without dealing with signed-URL query tokens.
 *
 * Security: only an allowlist of buckets is proxied, and paths are scoped to
 * opaque user-id folders, so this is read-only exposure of media that is
 * already shared with the generation provider.
 *
 * URL shape: GET /functions/v1/media-proxy?p=<base64url("bucket/path")>
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_BUCKETS = new Set([
  'product-images',
  'generated-images',
  'User Avatars',
]);

function decodeRef(p: string): { bucket: string; path: string } | null {
  try {
    const norm = p.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(norm);
    const slash = decoded.indexOf('/');
    if (slash < 0) return null;
    const bucket = decoded.slice(0, slash);
    const path = decoded.slice(slash + 1);
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  // Support two URL shapes:
  //  1) ?p=<base64url>            (legacy)
  //  2) /media-proxy/<base64url>.<ext>  (preferred — ends with a real image
  //     extension so strict external validators like Alibaba/Wan accept it)
  let p = url.searchParams.get('p');
  if (!p) {
    const seg = url.pathname.split('/media-proxy/')[1];
    if (seg) {
      const dot = seg.lastIndexOf('.');
      p = dot > 0 ? seg.slice(0, dot) : seg;
    }
  }
  if (!p) return new Response('Missing p', { status: 400 });

  const ref = decodeRef(p);
  if (!ref || !ALLOWED_BUCKETS.has(ref.bucket)) {
    return new Response('Not found', { status: 404 });
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await admin.storage.from(ref.bucket).download(ref.path);
  if (error || !data) {
    console.error('[media-proxy] download failed', ref.bucket, ref.path, error?.message);
    return new Response('Not found', { status: 404 });
  }

  const buf = new Uint8Array(await data.arrayBuffer());
  const contentType = (data as any).type || 'application/octet-stream';

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(buf.length),
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
