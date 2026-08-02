/**
 * dashscope-lipsync: submit an audio-driven (lip-sync) video task to DashScope.
 *
 * The Singapore region does not host the legacy `emo-v1` / `videoretalk`
 * models ("Model not exist"). The supported path is the unified Wan 2.7
 * image-to-video endpoint with a `first_frame` image plus a `driving_audio`
 * track, which performs the lip sync.
 *
 * Media is uploaded to DashScope's own OSS storage (oss:// URLs), the same
 * approach wan-video uses, because Alibaba's validator rejects our signed
 * Supabase URLs.
 *
 * On success we store provider_task_id and wan-video-poll takes over.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  DASHSCOPE_BASE,
  asyncAuthHeaders,
  getUserIdFromAuth,
  genericError,
  ok,
  uploadToDashScopeOss,
  normalizeImageForWan,
} from '../_shared/dashscope.ts';

const LIPSYNC_MODEL = 'wan2.7-i2v';

interface Body {
  requestId: string;
  mode: 'portrait' | 'video';
  prompt?: string;
  portraitUrl?: string;
  sourceVideoUrl?: string;
  audioUrl?: string;
}

function guessTypeFromExt(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    bmp: 'image/bmp', mp4: 'video/mp4', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac',
    webm: 'audio/webm', ogg: 'audio/ogg',
  };
  return map[ext] || 'application/octet-stream';
}

function parseSetting(prompt: string | undefined, key: string): string | undefined {
  if (!prompt) return undefined;
  const m = prompt.match(new RegExp(`\\|\\s*${key}\\s*:\\s*([^|\\n]+)`, 'i'));
  return m ? m[1].trim() : undefined;
}

function cleanPromptForModel(prompt: string | undefined): string {
  if (!prompt) return '';
  return prompt
    .replace(/\s*\|\s*(Aspect|Resolution|Duration|Timeline|First frame|Last frame)\s*:[^|\n]*/gi, '')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return genericError(405, 'Method not allowed');

  const userId = await getUserIdFromAuth(req, createClient);
  if (!userId) return genericError(401, 'Unauthorized');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: Body;
  try { body = await req.json(); } catch { return genericError(400, 'Invalid JSON'); }
  if (!body.requestId) return genericError(400, 'Missing requestId');

  const { data: reqRow } = await admin
    .from('generation_requests')
    .select('id, user_id')
    .eq('id', body.requestId)
    .maybeSingle();
  if (!reqRow || reqRow.user_id !== userId) return genericError(404, 'Request not found');

  if (!body.audioUrl) {
    await markFailed(admin, body.requestId, LIPSYNC_MODEL,
      'No audio track was attached for lip sync. Attach a WAV or MP3 voice track (2 to 30 seconds).');
    return genericError(400, 'Missing audioUrl');
  }

  // Upload storage: refs straight into DashScope OSS.
  const toOss = async (u?: string): Promise<string | undefined> => {
    if (!u) return undefined;
    if (!u.startsWith('storage:')) return u;
    const rest = u.slice('storage:'.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return undefined;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    const { data, error } = await admin.storage.from(bucket).download(path);
    if (error || !data) {
      console.error('[dashscope-lipsync] storage download failed', bucket, path, error?.message);
      return undefined;
    }
    const raw = new Uint8Array(await data.arrayBuffer());
    const filename = path.split('/').pop() || 'file';
    const rawType = (data as any).type || guessTypeFromExt(path);
    let bytes = raw;
    let contentType = rawType;
    if (rawType.startsWith('image/')) {
      const norm = await normalizeImageForWan(raw, rawType);
      bytes = norm.bytes;
      contentType = norm.contentType;
    }
    return await uploadToDashScopeOss(LIPSYNC_MODEL, bytes, filename, contentType);
  };

  let audioUrl: string | undefined;
  let portraitUrl: string | undefined;
  try {
    audioUrl = await toOss(body.audioUrl);
    portraitUrl = await toOss(body.portraitUrl);
  } catch (e) {
    console.error('[dashscope-lipsync] OSS upload failed', e);
    await markFailed(admin, body.requestId, LIPSYNC_MODEL,
      'Your media could not be uploaded to the provider. Please re-upload and try again.');
    return genericError(502, 'Submission failed');
  }

  if (!audioUrl) {
    await markFailed(admin, body.requestId, LIPSYNC_MODEL,
      'The audio file could not be read. Please re-upload it and try again.');
    return genericError(400, 'Could not resolve audioUrl');
  }
  if (!portraitUrl) {
    await markFailed(admin, body.requestId, LIPSYNC_MODEL,
      'Lip sync needs a clear photo with a visible face. Attach one image plus the audio track.');
    return genericError(400, 'Lip sync requires a portrait image');
  }
  if (body.mode === 'video' && body.sourceVideoUrl) {
    console.log('[dashscope-lipsync] video mode not supported in this region, using portrait path');
  }

  const modelPrompt = cleanPromptForModel(body.prompt) ||
    'A person speaking naturally to camera, lips synchronized with the audio.';
  const promptDuration = parseInt(parseSetting(body.prompt, 'Duration') || '', 10);
  const duration = Math.max(2, Math.min(15, Number.isFinite(promptDuration) ? promptDuration : 5));
  const rawResolution = String(parseSetting(body.prompt, 'Resolution') || '1080P').toUpperCase();
  const resolution = rawResolution === '720P' ? '720P' : '1080P';

  const endpoint = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
  const payload = {
    model: LIPSYNC_MODEL,
    input: {
      prompt: modelPrompt,
      media: [
        { type: 'first_frame', url: portraitUrl },
        { type: 'driving_audio', url: audioUrl },
      ],
    },
    parameters: { resolution, duration },
  };

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: asyncAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error('[dashscope-lipsync] upstream error', upstream.status, txt);
      await markFailed(admin, body.requestId, LIPSYNC_MODEL, humanizeUpstream(txt));
      return genericError(502, 'Submission failed');
    }

    const json = await upstream.json();
    const taskId: string | undefined = json?.output?.task_id;
    if (!taskId) {
      console.error('[dashscope-lipsync] no task_id', JSON.stringify(json).slice(0, 500));
      await markFailed(admin, body.requestId, LIPSYNC_MODEL, 'Provider did not return a task id.');
      return genericError(502, 'Submission failed');
    }

    await admin
      .from('generation_requests')
      .update({
        status: 'in-progress',
        auto_provider: 'wan',
        auto_model: LIPSYNC_MODEL,
        provider_task_id: taskId,
        auto_failed: false,
        failure_reason: null,
      })
      .eq('id', body.requestId);

    return ok({ ok: true, taskId, requestId: body.requestId });
  } catch (e) {
    console.error('[dashscope-lipsync] exception', e);
    await markFailed(admin, body.requestId, LIPSYNC_MODEL, 'Could not reach the provider.');
    return genericError(502, 'Submission failed');
  }
});

function humanizeUpstream(txt: string): string {
  const t = txt.toLowerCase();
  if (t.includes('model not exist')) return 'The lip sync model is not available on this account region.';
  if (t.includes('face')) return 'The provider could not detect a usable face in the photo. Try a clear, front-facing portrait.';
  if (t.includes('audio')) return 'The provider rejected the audio track. Use a WAV or MP3 between 2 and 30 seconds.';
  if (t.includes('invalidapikey')) return 'Provider rejected the API key.';
  return 'The provider rejected this lip sync request.';
}

async function markFailed(admin: any, requestId: string, model: string, reason: string) {
  await admin
    .from('generation_requests')
    .update({
      auto_provider: 'wan',
      auto_model: model,
      auto_failed: true,
      status: 'new',
      failure_reason: reason,
    })
    .eq('id', requestId);
}
