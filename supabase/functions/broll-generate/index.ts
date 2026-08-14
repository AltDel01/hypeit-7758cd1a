import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * broll-generate
 * action "create": starts one Veo b-roll job on the Lovable AI Gateway.
 * action "poll":   checks the job; once completed it downloads the MP4,
 *                  stores it in the private broll-media bucket and returns a signed URL.
 *
 * Jobs are created one at a time by the client (gateway limits concurrent video jobs).
 */

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/videos'
const BUCKET = 'broll-media'

type Orientation = 'portrait' | 'landscape' | 'square'

const sizeFor = (orientation: Orientation) =>
  orientation === 'portrait' ? '720x1280' : '1280x720'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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
      seconds?: number
      orientation?: Orientation
      quality?: 'lite' | 'fast' | 'high'
      videoId?: string
    }

    const action = body.action === 'poll' ? 'poll' : 'create'

    if (action === 'create') {
      const prompt = (body.prompt || '').toString().trim().slice(0, 1500)
      if (!prompt) return json({ error: 'A b-roll prompt is required.' }, 400)

      const allowed = [4, 6, 8]
      const secs = allowed.includes(Number(body.seconds)) ? Number(body.seconds) : 4
      const orientation: Orientation =
        body.orientation === 'portrait' || body.orientation === 'square' ? body.orientation : 'landscape'
      const model =
        body.quality === 'high' ? 'google/veo-3.1'
        : body.quality === 'fast' ? 'google/veo-3.1-fast'
        : 'google/veo-3.1-lite'

      const res = await fetch(GATEWAY, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          seconds: String(secs),
          size: sizeFor(orientation),
        }),
      })

      if (!res.ok) {
        const detail = await res.text()
        console.error('broll-generate create failed', res.status, detail.slice(0, 500))
        if (res.status === 429) {
          return json({ error: 'Another clip is still generating, please wait a moment.' }, 429)
        }
        if (res.status === 402) {
          return json({ error: 'Not enough AI credits to generate this clip.' }, 402)
        }
        return json({ error: 'The b-roll clip could not be started.' }, 400)
      }

      const job = await res.json()
      return json({ videoId: job.id, status: job.status ?? 'in_progress', model, seconds: secs })
    }

    // ---- poll ----
    const videoId = (body.videoId || '').toString().trim()
    if (!videoId) return json({ error: 'Missing clip id.' }, 400)

    const jobRes = await fetch(`${GATEWAY}/${encodeURIComponent(videoId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!jobRes.ok) {
      const detail = await jobRes.text()
      console.error('broll-generate poll failed', jobRes.status, detail.slice(0, 500))
      return json({ error: 'Could not check the clip status.' }, 502)
    }
    const job = await jobRes.json()

    if (job.status === 'failed') {
      return json({
        status: 'failed',
        error: job?.error?.message || 'The provider rejected this b-roll clip.',
      })
    }
    if (job.status !== 'completed') {
      return json({ status: job.status ?? 'in_progress', progress: job.progress ?? 0 })
    }

    const service = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const path = `${userId}/clips/${videoId}.mp4`

    // Idempotent: skip the download when the object already exists.
    const { data: existing } = await service.storage
      .from(BUCKET)
      .list(`${userId}/clips`, { search: `${videoId}.mp4` })

    if (!existing || existing.length === 0) {
      const contentRes = await fetch(`${GATEWAY}/${encodeURIComponent(videoId)}/content`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!contentRes.ok) {
        console.error('broll-generate download failed', contentRes.status)
        return json({ error: 'The finished clip could not be downloaded.' }, 502)
      }
      const bytes = await contentRes.arrayBuffer()
      const { error: upErr } = await service.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: 'video/mp4', upsert: true })
      if (upErr) {
        console.error('broll-generate upload failed', upErr.message)
        return json({ error: 'The finished clip could not be saved.' }, 500)
      }
    }

    const { data: signed, error: signErr } = await service.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 6)
    if (signErr || !signed?.signedUrl) {
      return json({ error: 'The finished clip could not be loaded.' }, 500)
    }

    return json({ status: 'completed', url: signed.signedUrl, path })
  } catch (e) {
    console.error('broll-generate unexpected error', e)
    return json({ error: 'Something went wrong while generating b-roll.' }, 500)
  }
})
