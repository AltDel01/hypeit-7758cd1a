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
