/**
 * Shared DashScope (Alibaba Cloud Model Studio) helpers.
 * Used by qwen-image, wan-video, wan-video-poll edge functions.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Singapore region endpoint (international)
export const DASHSCOPE_BASE = 'https://dashscope-intl.aliyuncs.com';

export function authHeaders(): Record<string, string> {
  const key = Deno.env.get('QWEN_API_KEY');
  if (!key) throw new Error('QWEN_API_KEY not configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Async DashScope task header. Required for video-synthesis endpoints.
 */
export function asyncAuthHeaders(): Record<string, string> {
  return {
    ...authHeaders(),
    'X-DashScope-Async': 'enable',
  };
}

/**
 * Upload a file to DashScope's own temporary OSS storage and return an
 * `oss://` URL. This is Alibaba's officially supported way to provide input
 * media; it avoids their image validator fetching external URLs (which is
 * unreliable for Supabase storage/proxy links).
 *
 * Requests using the returned URL must include the header
 * `X-DashScope-OssResourceResolve: enable`.
 */
export async function uploadToDashScopeOss(
  model: string,
  bytes: Uint8Array,
  filename: string,
  contentType: string
): Promise<string> {
  const polRes = await fetch(
    `${DASHSCOPE_BASE}/api/v1/uploads?action=getPolicy&model=${encodeURIComponent(model)}`,
    { headers: authHeaders() }
  );
  if (!polRes.ok) {
    throw new Error(`getPolicy failed: ${polRes.status} ${await polRes.text()}`);
  }
  const pol = (await polRes.json())?.data;
  if (!pol?.upload_host || !pol?.upload_dir) {
    throw new Error('getPolicy returned invalid data');
  }

  const key = `${pol.upload_dir}/${Date.now()}-${filename}`;
  const form = new FormData();
  form.append('OSSAccessKeyId', pol.oss_access_key_id);
  form.append('Signature', pol.signature);
  form.append('policy', pol.policy);
  form.append('x-oss-object-acl', pol.x_oss_object_acl);
  form.append('x-oss-forbid-overwrite', pol.x_oss_forbid_overwrite);
  form.append('key', key);
  form.append('success_action_status', '200');
  form.append('file', new Blob([bytes], { type: contentType }), filename);

  const upRes = await fetch(pol.upload_host, { method: 'POST', body: form });
  if (!upRes.ok) {
    throw new Error(`OSS upload failed: ${upRes.status} ${await upRes.text()}`);
  }
  return `oss://${key}`;
}

export interface DashScopeAsyncCreateResponse {
  output?: { task_id?: string; task_status?: string };
  request_id?: string;
  code?: string;
  message?: string;
}

export interface DashScopeAsyncResultResponse {
  output?: {
    task_id?: string;
    task_status?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    results?: Array<{ url?: string; video_url?: string }>;
    video_url?: string;
    message?: string;
    code?: string;
  };
  code?: string;
  message?: string;
}

/**
 * Validate JWT in code (signing-keys flow) and return the user id.
 * Returns null if invalid.
 */
export async function getUserIdFromAuth(
  req: Request,
  createClient: (url: string, key: string, opts?: any) => any
): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return null;

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

export function genericError(status: number, message = 'Request failed') {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
