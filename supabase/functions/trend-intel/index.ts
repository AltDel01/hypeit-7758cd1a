import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface IntelBody {
  industry?: string
  platforms?: string[]
  competitors?: string[]
}

const PLATFORM_DOMAINS: Record<string, { label: string; site?: string }> = {
  tiktok: { label: 'TikTok', site: 'tiktok.com' },
  instagram: { label: 'Instagram', site: 'instagram.com' },
  facebook: { label: 'Facebook', site: 'facebook.com' },
  youtube: { label: 'YouTube', site: 'youtube.com' },
}

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2'

interface Hit {
  bucket: string
  title: string
  description: string
  url: string
}

async function firecrawlSearch(apiKey: string, query: string, limit = 6): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    })
    if (res.status === 402) throw new Error('FIRECRAWL_402')
    if (res.status === 429) throw new Error('FIRECRAWL_429')
    if (!res.ok) {
      console.error('Firecrawl search failed', res.status, await res.text())
      return []
    }
    const data = await res.json()
    const raw = data?.data?.web || data?.data || data?.web || []
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    if (e instanceof Error && (e.message === 'FIRECRAWL_402' || e.message === 'FIRECRAWL_429')) throw e
    console.error('Firecrawl search error', e)
    return []
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!lovableKey || !firecrawlKey) {
      return new Response(JSON.stringify({ error: 'Trend intelligence is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as IntelBody
    const industry = (body.industry || '').toString().trim().slice(0, 200)
    const platforms = (Array.isArray(body.platforms) ? body.platforms : [])
      .map((p) => (p || '').toString().toLowerCase().trim())
      .filter((p) => PLATFORM_DOMAINS[p])
    const competitors = (Array.isArray(body.competitors) ? body.competitors : [])
      .map((c) => (c || '').toString().trim().slice(0, 100))
      .filter(Boolean)
      .slice(0, 5)

    if (!industry) {
      return new Response(JSON.stringify({ error: 'Please provide an industry or niche.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (platforms.length === 0) {
      return new Response(JSON.stringify({ error: 'Please select at least one platform.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const year = new Date().getFullYear()
    const hits: Hit[] = []
    let creditsError = false
    let rateLimited = false

    const queries: Array<{ bucket: string; query: string }> = []
    for (const p of platforms) {
      const meta = PLATFORM_DOMAINS[p]
      queries.push({
        bucket: meta.label,
        query: `${industry} trending content ${year} site:${meta.site}`,
      })
    }
    queries.push({ bucket: 'Sounds', query: `trending sounds and audio on TikTok and Instagram Reels ${industry} ${year}` })
    queries.push({ bucket: 'Hashtags', query: `viral hashtags for ${industry} ${year} tiktok instagram` })
    for (const c of competitors) {
      queries.push({ bucket: `Competitor: ${c}`, query: `${c} social media content strategy viral posts ${year}` })
    }

    for (const q of queries) {
      try {
        const results = await firecrawlSearch(firecrawlKey, q.query, 6)
        for (const r of results.slice(0, 6)) {
          hits.push({
            bucket: q.bucket,
            title: (r.title || '').toString().slice(0, 200),
            description: (r.description || r.snippet || '').toString().slice(0, 400),
            url: (r.url || '').toString().slice(0, 400),
          })
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'FIRECRAWL_402') creditsError = true
        if (e instanceof Error && e.message === 'FIRECRAWL_429') rateLimited = true
      }
    }

    if (creditsError && hits.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search credits are exhausted. Please add Firecrawl credits and try again.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    if (rateLimited && hits.length === 0) {
      return new Response(JSON.stringify({ error: 'Too many requests, please try again shortly.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const contextLines = hits
      .map((h, i) => `${i + 1}. [${h.bucket}] ${h.title}, ${h.description} (${h.url})`)
      .join('\n')
      .slice(0, 14000)

    const platformLabels = platforms.map((p) => PLATFORM_DOMAINS[p].label).join(', ')

    const prompt = `You are a social media trend intelligence analyst. Using the real search results below, report what is trending right now in the "${industry}" niche across: ${platformLabels}.

Search results (public titles and snippets):
"""
${contextLines || 'No search results available, infer sensibly from general knowledge of the niche.'}
"""

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "platforms": [
    {
      "platform": "one of: ${platformLabels}",
      "topics": ["short trending topic"],
      "formats": ["content format performing well"],
      "hooks": ["recurring hook style"],
      "postingTip": "one sentence tactical tip for this platform"
    }
  ],
  "sounds": [
    { "name": "sound or audio track name", "platform": "TikTok or Instagram", "vibe": "mood or use case", "useFor": "what content type to pair it with" }
  ],
  "hashtags": [
    { "tag": "#example", "platform": "platform label", "momentum": "Rising, Hot or Steady", "note": "short reason it works" }
  ],
  "competitors": [
    { "name": "competitor name", "whatTheyPost": "one sentence", "whatWorks": "one sentence", "gapForYou": "one sentence opportunity" }
  ],
  "actions": ["3 to 5 concrete next content moves"]
}
Provide one platforms entry per platform listed, 6 sounds, 10 hashtags, and ${competitors.length > 0 ? `one competitors entry for each of: ${competitors.join(', ')}` : '3 competitors entries for the most visible brands in this niche'}. Never use em dashes.`

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': lovableKey },
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
      return new Response(JSON.stringify({ error: 'Trend intelligence failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await aiRes.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(content)
    } catch (_e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const arr = (k: string) => (Array.isArray(parsed[k]) ? (parsed[k] as unknown[]) : [])

    return new Response(
      JSON.stringify({
        platforms: arr('platforms'),
        sounds: arr('sounds'),
        hashtags: arr('hashtags'),
        competitors: arr('competitors'),
        actions: arr('actions'),
        sourceCount: hits.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('trend-intel error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during trend intelligence.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
