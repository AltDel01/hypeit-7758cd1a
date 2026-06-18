import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface ScanBody {
  brandName?: string
  website?: string
  niche?: string
  social?: { instagram?: string; tiktok?: string; facebook?: string }
}

const HEX = /^#([0-9a-fA-F]{6})$/

// Best-effort fetch of website text to ground the analysis.
async function fetchSiteText(url: string): Promise<string> {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(normalized, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandScan/1.0)' },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const html = await res.text()
    // Strip tags, scripts, styles and collapse whitespace.
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 6000)
  } catch (_e) {
    return ''
  }
}

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

    const body = (await req.json().catch(() => ({}))) as ScanBody
    const brandName = (body.brandName || '').toString().slice(0, 200)
    const website = (body.website || '').toString().slice(0, 500)
    const niche = (body.niche || '').toString().slice(0, 100)
    const social = body.social || {}

    if (!brandName.trim() && !website.trim()) {
      return new Response(JSON.stringify({ error: 'Provide a brand name or website to scan.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteText = website ? await fetchSiteText(website) : ''

    const prompt = `You are a brand strategist. Analyze the brand below and infer its positioning.

Brand name: ${brandName || 'unknown'}
Website: ${website || 'none'}
Niche/category: ${niche || 'unknown'}
Instagram: ${social.instagram || 'none'}
TikTok: ${social.tiktok || 'none'}
Facebook: ${social.facebook || 'none'}

Website content extracted (may be empty):
"""
${siteText || 'No website content available.'}
"""

Return ONLY a JSON object (no markdown) with:
- "brandMessage": one concise sentence (max 140 chars) capturing the brand tone, voice and value proposition.
- "brandColor": the single most representative primary brand color as a 6-digit hex string like "#8C52FF".
Base your answer on the website content if available, otherwise infer sensibly from the name and niche.`

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
      return new Response(JSON.stringify({ error: 'Brand scan failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await aiRes.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    let parsed: { brandMessage?: string; brandColor?: string } = {}
    try {
      parsed = JSON.parse(content)
    } catch (_e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const brandMessage = (parsed.brandMessage || '').toString().slice(0, 200)
    let brandColor = (parsed.brandColor || '').toString().trim()
    if (!HEX.test(brandColor)) brandColor = '#8C52FF'

    return new Response(JSON.stringify({ brandMessage, brandColor }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('brand-scan error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during brand scan.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
