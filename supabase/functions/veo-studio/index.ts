import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  DASHSCOPE_BASE,
  authHeaders,
  asyncAuthHeaders,
  uploadToDashScopeOss,
  normalizeImageForWan,
} from '../_shared/dashscope.ts'

/**
 * veo-studio
 * Unlisted video workbench backend, now powered by Alibaba Wan on DashScope.
 *  action "create": starts a Wan job (wan2.7-t2v, or wan2.7-i2v when a first frame is sent).
 *  action "poll":   checks the task; on success downloads the MP4, stores it in the
 *                   private broll-media bucket and returns a signed URL.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CREATE_URL = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`
const TASK_URL = `${DASHSCOPE_BASE}/api/v1/tasks`
const BUCKET = 'broll-media'

const SIZES: Record<string, Record<string, string>> = {
  '720p': { landscape: '1280*720', portrait: '720*1280' },
  '1080p': { landscape: '1920*1080', portrait: '1080*1920' },
}

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!m) return null
  const binary = atob(m[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, contentType: m[1] }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userData.user.id

    if (!Deno.env.get('QWEN_API_KEY')) return json({ error: 'AI is not configured.' }, 500)

    const body = (await req.json().catch(() => ({}))) as {
      action?: string
      prompt?: string
      seconds?: number | string
      orientation?: 'landscape' | 'portrait'
      resolution?: '720p' | '1080p'
      quality?: 'lite' | 'fast' | 'high'
      inputReference?: string
      videoId?: string
    }

    if ((body.action ?? 'create') === 'create') {
      const prompt = (body.prompt || '').toString().trim()
      if (!prompt) return json({ error: 'A prompt is required.' }, 400)

      const orientation = body.orientation === 'portrait' ? 'portrait' : 'landscape'
      const resolution = body.resolution === '1080p' ? '1080p' : '720p'

      const seconds = clampWanDuration(body.seconds, 5)

      const ref = (body.inputReference || '').toString()
      let firstFrame: string | undefined
      const baseModel = ref ? 'wan2.7-i2v' : 'wan2.7-t2v'
      const model = needsLongFormModel(seconds) ? WAN_LONGFORM_MODEL : baseModel


      if (ref) {
        if (!ref.startsWith('data:image/')) {
          return json({ error: 'The reference image must be sent as image data.' }, 400)
        }
        const decoded = decodeDataUrl(ref)
        if (!decoded) return json({ error: 'The reference image could not be read.' }, 400)
        try {
          const normalized = await normalizeImageForWan(decoded.bytes, decoded.contentType)
          firstFrame = await uploadToDashScopeOss(
            model,
            normalized.bytes,
            `frame.${normalized.contentType.includes('png') ? 'png' : 'jpg'}`,
            normalized.contentType,
          )
        } catch (e) {
          console.error('veo-studio reference upload failed', e)
          return json({ error: 'The reference image could not be sent to the provider.' }, 502)
        }
      }

      const input: Record<string, unknown> = { prompt }
      if (firstFrame) input.media = [{ type: 'first_frame', url: firstFrame }]

      const headers: Record<string, string> = {}
      if (firstFrame) headers['X-DashScope-OssResourceResolve'] = 'enable'

      const result = await createWanVideoTask({
        endpoint: CREATE_URL,
        model,
        input,
        parameters: {
          resolution: resolution === '1080p' ? '1080P' : '720P',
          duration: seconds,
          size: SIZES[resolution][orientation],
        },
        headers,
        fallbackModel: baseModel,
      })

      if (!result.ok) {
        console.error('veo-studio create failed', result.status, result.detail.slice(0, 600))
        if (result.status === 429) {
          return json({ error: 'The provider is rate limiting, please wait a moment.' }, 429)
        }
        return json(
          { error: ref
            ? 'The provider rejected this request. The prompt or the reference image may be the cause.'
            : 'The provider rejected this request. Try adjusting the prompt.' },
          400,
        )
      }

      return json({
        videoId: result.taskId,
        status: 'in_progress',
        model: result.model,
        seconds: result.duration || seconds,
        resolution,
        orientation,
      })

    }

    // ---- poll ----
    const videoId = (body.videoId || '').toString().trim()
    if (!videoId) return json({ error: 'Missing clip id.' }, 400)

    const jobRes = await fetch(`${TASK_URL}/${encodeURIComponent(videoId)}`, {
      headers: authHeaders(),
    })
    if (!jobRes.ok) {
      console.error('veo-studio poll failed', jobRes.status)
      return json({ error: 'Could not check the clip status.' }, 502)
    }
    const job = await jobRes.json()
    const state = job?.output?.task_status

    if (state === 'FAILED' || state === 'UNKNOWN' || state === 'CANCELED') {
      console.error('veo-studio task failed', JSON.stringify(job?.output).slice(0, 500))
      return json({
        status: 'failed',
        error: job?.output?.message || 'The provider rejected this clip.',
      })
    }
    if (state !== 'SUCCEEDED') {
      return json({ status: 'in_progress', progress: 0 })
    }

    const remoteUrl: string | undefined =
      job?.output?.video_url ||
      job?.output?.results?.[0]?.video_url ||
      job?.output?.results?.[0]?.url
    if (!remoteUrl) {
      console.error('veo-studio no video url', JSON.stringify(job?.output).slice(0, 500))
      return json({ error: 'The finished clip could not be downloaded.' }, 502)
    }

    const service = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const path = `${userId}/veo/${videoId}.mp4`

    const { data: existing } = await service.storage
      .from(BUCKET)
      .list(`${userId}/veo`, { search: `${videoId}.mp4` })

    if (!existing || existing.length === 0) {
      const contentRes = await fetch(remoteUrl)
      if (!contentRes.ok) {
        console.error('veo-studio download failed', contentRes.status)
        return json({ error: 'The finished clip could not be downloaded.' }, 502)
      }
      const bytes = await contentRes.arrayBuffer()
      const { error: upErr } = await service.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: 'video/mp4', upsert: true })
      if (upErr) {
        console.error('veo-studio upload failed', upErr.message)
        return json({ error: 'The finished clip could not be saved.' }, 500)
      }
    }

    const { data: signed, error: signErr } = await service.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 12)
    if (signErr || !signed?.signedUrl) {
      return json({ error: 'The finished clip could not be loaded.' }, 500)
    }

    return json({ status: 'completed', url: signed.signedUrl, path })
  } catch (e) {
    console.error('veo-studio unexpected error', e)
    return json({ error: 'Something went wrong in the video studio.' }, 500)
  }
})
