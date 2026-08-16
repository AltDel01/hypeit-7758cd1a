import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * veo-studio
 * Unlisted Veo workbench backend.
 *  action "create": starts a Veo job (text-to-video or image-to-video / first frame).
 *  action "poll":   checks a job; on completion downloads the MP4, stores it in the
 *                   private broll-media bucket and returns a signed URL.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/videos'
const BUCKET = 'broll-media'

const MODELS: Record<string, string> = {
  lite: 'google/veo-3.1-lite',
  fast: 'google/veo-3.1-fast',
  high: 'google/veo-3.1',
}

const SIZES: Record<string, Record<string, string>> = {
  '720p': { landscape: '1280x720', portrait: '720x1280' },
  '1080p': { landscape: '1920x1080', portrait: '1080x1920' },
  '4k': { landscape: '3840x2160', portrait: '2160x3840' },
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

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500)

    const body = (await req.json().catch(() => ({}))) as {
      action?: string
      prompt?: string
      seconds?: number | string
      orientation?: 'landscape' | 'portrait'
      resolution?: '720p' | '1080p' | '4k'
      quality?: 'lite' | 'fast' | 'high'
      inputReference?: string
      videoId?: string
    }

    if ((body.action ?? 'create') === 'create') {
      const prompt = (body.prompt || '').toString().trim()
      if (!prompt) return json({ error: 'A prompt is required.' }, 400)

      const quality = body.quality && MODELS[body.quality] ? body.quality : 'lite'
      const model = MODELS[quality]

      const orientation = body.orientation === 'portrait' ? 'portrait' : 'landscape'
      let resolution = body.resolution && SIZES[body.resolution] ? body.resolution : '720p'
      if (resolution === '4k' && quality === 'lite') resolution = '1080p'

      let seconds = Number(body.seconds)
      if (![4, 6, 8].includes(seconds)) seconds = 8
      if (resolution !== '720p') seconds = 8 // 1080p and 4k are 8-second only

      const payload: Record<string, unknown> = {
        model,
        prompt,
        seconds: String(seconds),
        size: SIZES[resolution][orientation],
      }

      const ref = (body.inputReference || '').toString()
      if (ref) {
        if (!ref.startsWith('data:image/')) {
          return json({ error: 'The reference image must be sent as image data.' }, 400)
        }
        payload.input_reference = ref
      }

      const res = await fetch(GATEWAY, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const detail = await res.text()
        console.error('veo-studio create failed', res.status, detail.slice(0, 600))
        if (res.status === 429) {
          return json({ error: 'Another clip is still generating, please wait for it to finish.' }, 429)
        }
        if (res.status === 402) {
          return json({ error: 'Not enough AI credits to generate this clip.' }, 402)
        }
        return json(
          { error: ref
            ? 'The provider rejected this request. The prompt or the reference image may be the cause.'
            : 'The provider rejected this request. Try adjusting the prompt.' },
          400,
        )
      }

      const job = await res.json()
      return json({
        videoId: job.id,
        status: job.status ?? 'in_progress',
        model,
        seconds,
        resolution,
        orientation,
      })
    }

    // ---- poll ----
    const videoId = (body.videoId || '').toString().trim()
    if (!videoId) return json({ error: 'Missing clip id.' }, 400)

    const jobRes = await fetch(`${GATEWAY}/${encodeURIComponent(videoId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!jobRes.ok) {
      console.error('veo-studio poll failed', jobRes.status)
      return json({ error: 'Could not check the clip status.' }, 502)
    }
    const job = await jobRes.json()

    if (job.status === 'failed') {
      return json({
        status: 'failed',
        error: job?.error?.message || 'The provider rejected this clip.',
      })
    }
    if (job.status !== 'completed') {
      return json({ status: job.status ?? 'in_progress', progress: job.progress ?? 0 })
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
      const contentRes = await fetch(`${GATEWAY}/${encodeURIComponent(videoId)}/content`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
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
    return json({ error: 'Something went wrong in the Veo studio.' }, 500)
  }
})
