import { createClient } from 'npm:@supabase/supabase-js@2'
import { arkCreateVideoTask, clampArkDuration, pollVideoTask } from '../_shared/modelark.ts'
import { normalizeImageForWan } from '../_shared/dashscope.ts'


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

const BUCKET = 'broll-media'

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

    if (!Deno.env.get('ARK_API_KEY')) return json({ error: 'AI is not configured.' }, 500)

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
      const resolution = body.resolution === '1080p' ? '1080p' : body.resolution === '480p' ? '480p' : '720p'

      const seconds = clampArkDuration(body.seconds, 5)

      const ref = (body.inputReference || '').toString()
      let firstFrame: string | undefined

      if (ref) {
        if (!ref.startsWith('data:image/')) {
          return json({ error: 'The reference image must be sent as image data.' }, 400)
        }
        const decoded = decodeDataUrl(ref)
        if (!decoded) return json({ error: 'The reference image could not be read.' }, 400)
        const normalized = await normalizeImageForWan(decoded.bytes, decoded.contentType)
        let bin = ''
        for (let i = 0; i < normalized.bytes.length; i += 0x8000) bin += String.fromCharCode(...normalized.bytes.subarray(i, i + 0x8000))
        firstFrame = `data:${normalized.contentType};base64,${btoa(bin)}`
      }

      const result = await arkCreateVideoTask({
        prompt,
        duration: seconds,
        resolution,
        ratio: orientation === 'portrait' ? '9:16' : '16:9',
        images: firstFrame ? [{ url: firstFrame, role: 'first_frame' }] : [],
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

    const polled = await pollVideoTask(videoId.startsWith('cgt-') ? 'modelark' : 'wan', videoId)
    if (!polled) {
      console.error('veo-studio poll failed')
      return json({ error: 'Could not check the clip status.' }, 502)
    }
    if (polled.state === 'failed') {
      return json({ status: 'failed', error: polled.reason })
    }
    if (polled.state !== 'succeeded') {
      return json({ status: 'in_progress', progress: 0 })
    }

    const remoteUrl: string | undefined = polled.videoUrl
    if (!remoteUrl) {
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
