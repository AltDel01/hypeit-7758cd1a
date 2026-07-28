import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface ResearchBody {
  industry?: string
  platforms?: string[]
  region?: string
  timeframe?: string
  audience?: string
  goal?: string
  formats?: string[]
  tone?: string
  ideaCount?: number
  competitors?: string
  keywords?: string
  exclude?: string
  depth?: string
}

const PLATFORM_DOMAINS: Record<string, { label: string; site?: string }> = {
  youtube: { label: 'YouTube', site: 'youtube.com' },
  tiktok: { label: 'TikTok', site: 'tiktok.com' },
  x: { label: 'X / Twitter', site: 'x.com' },
  instagram: { label: 'Instagram', site: 'instagram.com' },
  facebook: { label: 'Facebook', site: 'facebook.com' },
  linkedin: { label: 'LinkedIn', site: 'linkedin.com' },
  reddit: { label: 'Reddit', site: 'reddit.com' },
  pinterest: { label: 'Pinterest', site: 'pinterest.com' },
  threads: { label: 'Threads', site: 'threads.net' },
  web: { label: 'General Web' },
}

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2'

interface SearchHit {
  platform: string
  title: string
  description: string
  url: string
}

async function firecrawlSearch(apiKey: string, query: string, limit = 8): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    })
    if (res.status === 402) throw new Error('FIRECRAWL_402')
    if (res.status === 429) throw new Error('FIRECRAWL_429')
    if (!res.ok) {
      console.error('Firecrawl search failed', res.status, await res.text())
      return []
    }
    const data = await res.json()
    // v2 responses may nest results under data or data.web
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
      return new Response(JSON.stringify({ error: 'Research service is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as ResearchBody
    const industry = (body.industry || '').toString().trim().slice(0, 200)
    const requested = Array.isArray(body.platforms) ? body.platforms : []
    const platforms = requested
      .map((p) => (p || '').toString().toLowerCase().trim())
      .filter((p) => PLATFORM_DOMAINS[p])

    const str = (v: unknown, max = 200) => (v || '').toString().trim().slice(0, max)
    const region = str(body.region, 80) || 'Global'
    const timeframe = str(body.timeframe, 40) || 'last 30 days'
    const audience = str(body.audience, 200)
    const goal = str(body.goal, 60) || 'Awareness'
    const tone = str(body.tone, 60) || 'Any'
    const depth = str(body.depth, 20) || 'standard'
    const competitors = str(body.competitors, 400)
    const keywords = str(body.keywords, 400)
    const exclude = str(body.exclude, 400)
    const formats = Array.isArray(body.formats) ? body.formats.map((f) => str(f, 40)).filter(Boolean).slice(0, 10) : []
    const ideaCount = Math.min(Math.max(Number(body.ideaCount) || 8, 3), 20)
    const perPlatformLimit = depth === 'deep' ? 12 : depth === 'quick' ? 4 : 8

    if (!industry) {
      return new Response(JSON.stringify({ error: 'Please provide an industry to research.' }), {
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

    // Run one search per platform.
    let creditsError = false
    let rateLimited = false
    const hits: SearchHit[] = []

    const regionTerm = region && region.toLowerCase() !== 'global' ? ` ${region}` : ''
    const keywordTerm = keywords ? ` ${keywords.split(',').slice(0, 3).join(' ')}` : ''

    for (const p of platforms) {
      const meta = PLATFORM_DOMAINS[p]
      const query = meta.site
        ? `${industry}${regionTerm}${keywordTerm} trending viral content ${year} site:${meta.site}`
        : `${industry}${regionTerm}${keywordTerm} trending topics and viral content ideas ${year}`
      try {
        const results = await firecrawlSearch(firecrawlKey, query, perPlatformLimit)
        for (const r of results.slice(0, perPlatformLimit)) {
          hits.push({
            platform: meta.label,
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

    // Optional competitor sweep
    if (competitors) {
      const handles = competitors.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 3)
      for (const h of handles) {
        try {
          const results = await firecrawlSearch(firecrawlKey, `${h} ${industry} best performing posts ${year}`, 4)
          for (const r of results.slice(0, 4)) {
            hits.push({
              platform: `Competitor: ${h}`,
              title: (r.title || '').toString().slice(0, 200),
              description: (r.description || r.snippet || '').toString().slice(0, 400),
              url: (r.url || '').toString().slice(0, 400),
            })
          }
        } catch (_e) {
          // non-fatal
        }
      }
    }

    if (creditsError && hits.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Research search credits are exhausted. Please add Firecrawl credits and try again.' }),
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
      .map((h, i) => `${i + 1}. [${h.platform}] ${h.title} , ${h.description} (${h.url})`)
      .join('\n')
      .slice(0, 16000)

    const platformLabels = platforms.map((p) => PLATFORM_DOMAINS[p].label).join(', ')

    const prompt = `You are a senior short-form social media strategist. Using the real search results below, analyze what is currently trending in the "${industry}" industry across these platforms: ${platformLabels}.

Research brief:
- Market / region: ${region}
- Timeframe focus: ${timeframe}
- Target audience: ${audience || 'general audience for this industry'}
- Primary goal: ${goal}
- Preferred formats: ${formats.length ? formats.join(', ') : 'any high performing format'}
- Tone of voice: ${tone}
- Must-include keywords: ${keywords || 'none'}
- Avoid these topics or terms: ${exclude || 'none'}
- Competitors to benchmark: ${competitors || 'none provided'}

Search results (public titles and snippets):
"""
${contextLines || 'No search results available, infer sensibly from general knowledge of the industry.'}
"""

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "summary": "3 sentence executive summary of the current trend landscape",
  "trendReport": [
    {
      "platform": "one of the platform labels",
      "momentum": "rising | peaking | cooling",
      "score": 0-100 opportunity score as a number,
      "topics": ["short trending topic", "another"],
      "formats": ["content format that performs well"],
      "hooks": ["recurring hook style seen on this platform"],
      "hashtags": ["#tag"],
      "sounds": ["trending sound or audio style, empty array if not applicable"],
      "bestPostTimes": ["e.g. Tue 7-9pm"]
    }
  ],
  "competitorInsights": [
    { "name": "competitor or account archetype", "whatWorks": "one sentence", "gap": "one sentence opportunity you can own" }
  ],
  "contentIdeas": [
    {
      "title": "concise idea name (max 70 chars)",
      "platform": "best-fit platform label",
      "format": "e.g. talking head, before/after, listicle",
      "difficulty": "easy | medium | hard",
      "viralScore": 0-100 as a number,
      "angle": "one sentence on the creative angle",
      "hookExample": "a scroll-stopping opening line (max 90 chars)",
      "caption": "ready to post caption (max 220 chars)",
      "hashtags": ["#tag"],
      "cta": "one short call to action",
      "whyItWorks": "one sentence rationale grounded in the trends"
    }
  ]
}
Provide one trendReport entry per platform listed, and ${ideaCount} ranked contentIdeas (best first). Never use em dashes.`

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': lovableKey,
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
      return new Response(JSON.stringify({ error: 'Trend research failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await aiRes.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    let parsed: {
      summary?: string
      trendReport?: unknown[]
      contentIdeas?: unknown[]
      competitorInsights?: unknown[]
    } = {}
    try {
      parsed = JSON.parse(content)
    } catch (_e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const trendReport = Array.isArray(parsed.trendReport) ? parsed.trendReport : []
    const contentIdeas = Array.isArray(parsed.contentIdeas) ? parsed.contentIdeas : []
    const competitorInsights = Array.isArray(parsed.competitorInsights) ? parsed.competitorInsights : []
    const summary = typeof parsed.summary === 'string' ? parsed.summary : ''

    return new Response(
      JSON.stringify({ summary, trendReport, contentIdeas, competitorInsights, sourceCount: hits.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('trend-research error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during trend research.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
