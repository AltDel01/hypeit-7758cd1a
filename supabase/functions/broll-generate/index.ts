import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  DASHSCOPE_BASE,
  authHeaders,
  asyncAuthHeaders,
} from '../_shared/dashscope.ts'

/**
 * broll-generate
 * action "create": starts one Alibaba Wan b-roll job on DashScope (async task).
 * action "poll":   checks the task; once succeeded it downloads the MP4,
 *                  stores it in the private broll-media bucket and returns a signed URL.
 *
 * Jobs are created one at a time by the client.
 */

const CREATE_URL = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`
const TASK_URL = `${DASHSCOPE_BASE}/api/v1/tasks`
const BUCKET = 'broll-media'
const MODEL = 'wan2.7-t2v'

type Orientation = 'portrait' | 'landscape' | 'square'

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

    if (!Deno.env.get('QWEN_API_KEY')) return json({ error: 'AI is not configured.' }, 500)

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

      // Wan supports 2-15s clips.
      const rawSecs = Number(body.seconds)
      const secs = Number.isFinite(rawSecs) ? Math.max(2, Math.min(15, Math.round(rawSecs))) : 5
      const orientation: Orientation =
        body.orientation === 'portrait' || body.orientation === 'square' ? body.orientation : 'landscape'
      // Wan accepts 720P or 1080P only.
      const resolution = body.quality === 'lite' ? '720P' : '1080P'
      const size =
        orientation === 'portrait' ? (resolution === '720P' ? '720*1280' : '1080*1920')
        : orientation === 'square' ? (resolution === '720P' ? '960*960' : '1440*1440')
        : (resolution === '720P' ? '1280*720' : '1920*1080')

      const res = await fetch(CREATE_URL, {
        method: 'POST',
        headers: asyncAuthHeaders(),
        body: JSON.stringify({
          model: MODEL,
          input: { prompt },
          parameters: { resolution, duration: secs, size },
        }),
      })

      const payload = await res.json().catch(() => null)
      const taskId = payload?.output?.task_id

      if (!res.ok || !taskId) {
        console.error('broll-generate create failed', res.status, JSON.stringify(payload).slice(0, 500))
        if (res.status === 429) {
          return json({ error: 'The provider is rate limiting, please wait a moment.' }, 429)
        }
        return json({ error: 'The b-roll clip could not be started.' }, 400)
      }

      return json({ videoId: taskId, status: 'in_progress', model: MODEL, seconds: secs })
    }

    // ---- poll ----
    const videoId = (body.videoId || '').toString().trim()
    if (!videoId) return json({ error: 'Missing clip id.' }, 400)

    const jobRes = await fetch(`${TASK_URL}/${encodeURIComponent(videoId)}`, {
      headers: authHeaders(),
    })
    if (!jobRes.ok) {
      const detail = await jobRes.text()
      console.error('broll-generate poll failed', jobRes.status, detail.slice(0, 500))
      return json({ error: 'Could not check the clip status.' }, 502)
    }
    const job = await jobRes.json()
    const state = job?.output?.task_status

    if (state === 'FAILED' || state === 'UNKNOWN' || state === 'CANCELED') {
      console.error('broll-generate task failed', JSON.stringify(job?.output).slice(0, 500))
      return json({
        status: 'failed',
        error: job?.output?.message || 'The provider rejected this b-roll clip.',
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
      console.error('broll-generate no video url', JSON.stringify(job?.output).slice(0, 500))
      return json({ error: 'The finished clip could not be downloaded.' }, 502)
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
      const contentRes = await fetch(remoteUrl)
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
