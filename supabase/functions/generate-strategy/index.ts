import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface StrategyBody {
  brandName?: string
  product?: string
  brandMessage?: string
  brandColor?: string
  social?: { instagram?: string; tiktok?: string; facebook?: string }
  ecommerce?: { tiktokshop?: string; shopee?: string; tokopedia?: string }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
// Per spec: 2 videos + 3 images across the week (5 content days, 2 rest as image too -> default split)
const DEFAULT_ASSET_TYPES = ['video', 'image', 'image', 'video', 'image', 'image', 'image']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as StrategyBody
    const brandName = (body.brandName || '').toString().slice(0, 200)
    const product = (body.product || '').toString().slice(0, 500)
    const brandMessage = (body.brandMessage || '').toString().slice(0, 300)
    const brandColor = (body.brandColor || '#8C52FF').toString().slice(0, 9)
    const social = body.social || {}
    const ecommerce = body.ecommerce || {}

    if (!brandName.trim() || !product.trim()) {
      return new Response(JSON.stringify({ error: 'Brand name and product are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const linkedChannels = [
      social.instagram && 'Instagram',
      social.tiktok && 'TikTok',
      social.facebook && 'Facebook',
      ecommerce.tiktokshop && 'TikTok Shop',
      ecommerce.shopee && 'Shopee',
      ecommerce.tokopedia && 'Tokopedia',
    ].filter(Boolean).join(', ') || 'none linked yet'

    const prompt = `You are a senior short-form social media strategist. Build a data-driven 7-day content plan for the brand below.

Brand name: ${brandName}
What they sell: ${product}
Brand voice/tone: ${brandMessage || 'infer a fitting tone'}
Brand color: ${brandColor}
Linked channels: ${linkedChannels}

Create exactly 7 distinct daily posts (Monday to Sunday). Each must be tailored to this specific product and brand voice, varied in angle (education, social proof, founder story, trend remix, myth-busting, behind-the-scenes, offer). Each day needs 3 short scenes for a vertical video/image carousel.

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "days": [
    {
      "benchmark": "one short data-style rationale with an emoji, e.g. '🔥 Mirrors top TikTok unboxing, 4.2M views'",
      "concept": "short concept name (max 60 chars)",
      "hook": "scroll-stopping first line spoken/shown on screen (max 90 chars)",
      "body": "one sentence describing the visual treatment and pacing (max 160 chars)",
      "scenes": [
        { "visual": "concrete visual direction for the shot", "voiceover": "spoken line for this scene" }
      ]
    }
  ]
}
Provide exactly 7 day objects, each with exactly 3 scenes.`

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'Too many requests, please try again shortly.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!aiRes.ok) {
      console.error('AI gateway error', aiRes.status, await aiRes.text())
      return new Response(JSON.stringify({ error: 'Strategy generation failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await aiRes.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    let parsed: { days?: Array<Record<string, unknown>> } = {}
    try {
      parsed = JSON.parse(content)
    } catch (_e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const rawDays = Array.isArray(parsed.days) ? parsed.days : []
    const days = DAYS.map((dayName, i) => {
      const d = (rawDays[i] || {}) as Record<string, unknown>
      const rawScenes = Array.isArray(d.scenes) ? (d.scenes as Array<Record<string, unknown>>) : []
      const scenes = [0, 1, 2].map((si) => {
        const s = rawScenes[si] || {}
        return {
          visual: (s.visual || '').toString().slice(0, 400),
          voiceover: (s.voiceover || '').toString().slice(0, 400),
        }
      })
      return {
        day: dayName,
        position: i,
        benchmark: (d.benchmark || '').toString().slice(0, 160),
        concept: (d.concept || '').toString().slice(0, 80),
        hook: (d.hook || '').toString().slice(0, 120),
        body: (d.body || '').toString().slice(0, 220),
        scenes,
        asset_type: DEFAULT_ASSET_TYPES[i],
      }
    })

    return new Response(JSON.stringify({ days }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('generate-strategy error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during strategy generation.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
