import { readSocialProfiles } from '../_shared/socialRead.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { callQwen } from '../_shared/qwen.ts'

interface StrategyBody {
  brandName?: string
  product?: string
  brandMessage?: string
  brandColor?: string
  website?: string
  social?: { instagram?: string; tiktok?: string; facebook?: string }
  ecommerce?: { tiktokshop?: string; shopee?: string; tokopedia?: string }
}

const DAYS = ['Day-1', 'Day-2', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Day-7']

// Best-effort read of the brand's website so the plan is grounded in real copy.
async function fetchSiteText(url: string): Promise<string> {
  if (!url.trim()) return ''
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(normalized, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViralinBrief/1.0)' },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const html = await res.text()
    const meta = [...html.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:description|og:title)["'][^>]*content=["']([^"']+)["']/gi)]
      .map((m) => m[1]).join(' | ')
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || ''
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return `${title} ${meta} ${text}`.slice(0, 6000)
  } catch (_e) {
    return ''
  }
}
// Per spec: 2 videos + 3 images across the week (5 content days, 2 rest as image too -> default split)
const DEFAULT_ASSET_TYPES = ['video', 'image', 'image', 'video', 'image', 'image', 'image']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(authHeader.slice(7))
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('QWEN_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as StrategyBody
    const brandName = (body.brandName || '').toString().slice(0, 200)
    const product = (body.product || '').toString().slice(0, 2000)
    const website = (body.website || '').toString().slice(0, 500)
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

    const [siteText, socialText] = await Promise.all([fetchSiteText(website), readSocialProfiles(social)])
    const socialLinks = [
      social.instagram && `Instagram: ${social.instagram}`,
      social.tiktok && `TikTok: ${social.tiktok}`,
      social.facebook && `Facebook: ${social.facebook}`,
      ecommerce.tiktokshop && `TikTok Shop: ${ecommerce.tiktokshop}`,
      ecommerce.shopee && `Shopee: ${ecommerce.shopee}`,
      ecommerce.tokopedia && `Tokopedia: ${ecommerce.tokopedia}`,
    ].filter(Boolean).join('\n') || 'none'

    const prompt = `You are a senior short-form social media strategist. First ANALYZE the brand below, then build a 7-day content plan that is specific to it. Never write generic filler: every hook, scene and voiceover must mention or show this brand's actual products, benefits, offers or customers.

Brand name: ${brandName}
What they sell / brief from the owner: ${product}
Brand voice/tone: ${brandMessage || 'infer a fitting tone'}
Brand color: ${brandColor}
Website: ${website || 'not provided'}
Social and shop links:
${socialLinks}
Linked channels: ${linkedChannels}
Website content (may be partial):
${siteText || 'not available'}
Recent social media posts (study their style, topics, products and what the audience responds to; build on it, don't copy):
${socialText || 'not available'}

Step 1, analysis: identify the target audience, their main pains and desires, the brand's unique selling points, and the language the audience speaks (write all hooks, voiceovers and captions in that language; default to the language of the owner's brief).
Step 2, plan: create exactly 7 distinct daily posts (Day-1 to Day-7), varied in angle (education, social proof, founder story, trend remix, myth-busting, behind-the-scenes, offer). Each day needs 3 short scenes for a vertical video or image carousel, plus a ready-to-post caption with hashtags.

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "analysis": {
    "audience": "who this is for (max 160 chars)",
    "pains": ["top audience pains"],
    "usps": ["brand's unique selling points"],
    "language": "content language"
  },
  "days": [
    {
      "benchmark": "one short data-style rationale with an emoji, e.g. '🔥 Mirrors top TikTok unboxing, 4.2M views'",
      "concept": "short concept name (max 60 chars)",
      "hook": "scroll-stopping first line spoken/shown on screen (max 90 chars)",
      "body": "one sentence describing the visual treatment and pacing (max 160 chars)",
      "caption": "ready-to-post caption with 3 to 6 hashtags (max 400 chars)",
      "scenes": [
        { "visual": "concrete visual direction for the shot", "voiceover": "spoken line for this scene" }
      ]
    }
  ]
}
Provide exactly 7 day objects, each with exactly 3 scenes.`

    const aiRes = await callQwen({
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
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
    let parsed: { days?: Array<Record<string, unknown>>; analysis?: Record<string, unknown> } = {}
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
      const assetType = DEFAULT_ASSET_TYPES[i]
      return {
        day: dayName,
        position: i,
        benchmark: (d.benchmark || '').toString().slice(0, 160),
        concept: (d.concept || '').toString().slice(0, 80),
        hook: (d.hook || '').toString().slice(0, 120),
        body: (d.body || '').toString().slice(0, 220),
        caption: (d.caption || '').toString().slice(0, 500),
        scenes,
        // Keep both names while older browser bundles still read camelCase.
        asset_type: assetType,
        assetType,
      }
    })

    return new Response(JSON.stringify({ days, analysis: parsed.analysis || null, usedWebsite: !!siteText }), {
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
