import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { callQwen } from '../_shared/qwen.ts'

/**
 * broll-plan
 * Receives sampled frames from a user's video (plus optional transcript/notes)
 * and asks Gemini which moments deserve a b-roll cutaway. Returns an
 * edit decision list (EDL) the client renders for review.
 */

interface PlanRequest {
  frames?: { time: number; dataUrl: string }[]
  duration?: number
  orientation?: 'portrait' | 'landscape' | 'square'
  transcript?: string
  notes?: string
  maxClips?: number
}

const MODEL = 'google/gemini-3-flash-preview'

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)

    const apiKey = Deno.env.get('QWEN_API_KEY')
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500)

    const body = (await req.json().catch(() => ({}))) as PlanRequest
    const frames = Array.isArray(body.frames) ? body.frames.slice(0, 20) : []
    if (frames.length === 0) return json({ error: 'No frames were provided from the video.' }, 400)

    const duration = Math.max(1, Math.min(Number(body.duration) || 0, 3600))
    const orientation = body.orientation === 'portrait' || body.orientation === 'square'
      ? body.orientation
      : 'landscape'
    const transcript = (body.transcript || '').toString().slice(0, 6000)
    const notes = (body.notes || '').toString().slice(0, 500)
    const maxClips = Math.max(1, Math.min(Number(body.maxClips) || 4, 6))

    const content: Record<string, unknown>[] = [
      {
        type: 'text',
        text: `You are a senior short-form video editor. Below are frames sampled from a ${Math.round(duration)} second ${orientation} video, each labelled with its timestamp in seconds.

${transcript ? `Spoken transcript:\n${transcript}\n` : 'No transcript is available, judge from the frames only.\n'}
${notes ? `Creator direction: ${notes}\n` : ''}
Pick at most ${maxClips} moments where inserting a b-roll cutaway would make the video more engaging. Prefer moments where the speaker describes something visual, where the frame stays static for a long time, or where energy drops. Never cover the hook in the first 2 seconds, and never pick two moments closer than 5 seconds apart.

Return ONLY a JSON object, no markdown, shaped exactly as:
{
  "summary": "one sentence on what the video is about",
  "moments": [
    {
      "start": 12.4,
      "duration": 4,
      "reason": "why b-roll helps here (max 90 chars)",
      "brollPrompt": "cinematic English prompt for an AI video model describing the cutaway shot",
      "overlayText": "short on-screen callout, max 24 chars, or empty string"
    }
  ]
}
Rules: "duration" must be 4, 6 or 8 seconds and must not run past the end of the video. "start" must be between 2 and ${Math.max(2, Math.round(duration) - 4)}. Order moments by start time.`,
      },
    ]

    for (const f of frames) {
      if (!f?.dataUrl || typeof f.dataUrl !== 'string') continue
      content.push({ type: 'text', text: `Frame at ${Number(f.time).toFixed(1)}s:` })
      content.push({ type: 'image_url', image_url: { url: f.dataUrl } })
    }

    const aiRes = await callQwen({
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
    }, { vision: true })

    if (!aiRes.ok) {
      const detail = await aiRes.text()
      console.error('broll-plan gateway error', aiRes.status, detail.slice(0, 500))
      if (aiRes.status === 429) return json({ error: 'Too many requests right now, try again in a moment.' }, 429)
      if (aiRes.status === 402) return json({ error: 'AI credits are exhausted for this workspace.' }, 402)
      return json({ error: 'Could not analyse the video.' }, 500)
    }

    const payload = await aiRes.json()
    const raw = payload?.choices?.[0]?.message?.content ?? ''
    let parsed: any = null
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch { parsed = null }
      }
    }
    if (!parsed || !Array.isArray(parsed.moments)) {
      console.error('broll-plan unparseable model output', String(raw).slice(0, 400))
      return json({ error: 'The analysis came back in an unexpected format, try again.' }, 502)
    }

    const allowed = [4, 6, 8]
    const moments = parsed.moments
      .slice(0, maxClips)
      .map((m: any, i: number) => {
        const start = Math.max(0, Math.min(Number(m?.start) || 0, Math.max(0, duration - 2)))
        let secs = Number(m?.duration) || 4
        if (!allowed.includes(secs)) secs = allowed.reduce((a, b) => (Math.abs(b - secs) < Math.abs(a - secs) ? b : a), 4)
        if (start + secs > duration) secs = 4
        return {
          id: `m${i + 1}`,
          start: Math.round(start * 10) / 10,
          duration: secs,
          reason: String(m?.reason || '').slice(0, 120),
          brollPrompt: String(m?.brollPrompt || '').slice(0, 600),
          overlayText: String(m?.overlayText || '').slice(0, 24),
        }
      })
      .filter((m: any) => m.brollPrompt.length > 0)

    return json({
      summary: String(parsed.summary || '').slice(0, 300),
      moments,
    })
  } catch (e) {
    console.error('broll-plan unexpected error', e)
    return json({ error: 'Something went wrong while analysing the video.' }, 500)
  }
})
