import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface ResearchBody {
  industry?: string
  platforms?: string[]
}

const PLATFORM_DOMAINS: Record<string, { label: string; site?: string }> = {
  youtube: { label: 'YouTube', site: 'youtube.com' },
  tiktok: { label: 'TikTok', site: 'tiktok.com' },
  x: { label: 'X / Twitter', site: 'x.com' },
  instagram: { label: 'Instagram', site: 'instagram.com' },
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

    for (const p of platforms) {
      const meta = PLATFORM_DOMAINS[p]
      const query = meta.site
        ? `${industry} trending viral content ${year} site:${meta.site}`
        : `${industry} trending topics and viral content ideas ${year}`
      try {
        const results = await firecrawlSearch(firecrawlKey, query, 8)
        for (const r of results.slice(0, 8)) {
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
      .map((h, i) => `${i + 1}. [${h.platform}] ${h.title} — ${h.description} (${h.url})`)
      .join('\n')
      .slice(0, 12000)

    const platformLabels = platforms.map((p) => PLATFORM_DOMAINS[p].label).join(', ')

    const prompt = `You are a senior short-form social media strategist. Using the real search results below, analyze what is currently trending in the "${industry}" industry across these platforms: ${platformLabels}.

Search results (public titles and snippets):
"""
${contextLines || 'No search results available, infer sensibly from general knowledge of the industry.'}
"""

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "trendReport": [
    {
      "platform": "one of the platform labels",
      "topics": ["short trending topic", "another"],
      "formats": ["content format that performs well, e.g. 'day-in-the-life', 'before/after'"],
      "hooks": ["recurring hook style seen on this platform"]
    }
  ],
  "contentIdeas": [
    {
      "title": "concise idea name (max 70 chars)",
      "platform": "best-fit platform label",
      "angle": "one sentence on the creative angle",
      "hookExample": "a scroll-stopping opening line (max 90 chars)",
      "whyItWorks": "one sentence rationale grounded in the trends"
    }
  ]
}
Provide one trendReport entry per platform listed, and 8 ranked contentIdeas (best first). Never use em dashes.`

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
    let parsed: { trendReport?: unknown[]; contentIdeas?: unknown[] } = {}
    try {
      parsed = JSON.parse(content)
    } catch (_e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const trendReport = Array.isArray(parsed.trendReport) ? parsed.trendReport : []
    const contentIdeas = Array.isArray(parsed.contentIdeas) ? parsed.contentIdeas : []

    return new Response(JSON.stringify({ trendReport, contentIdeas, sourceCount: hits.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('trend-research error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during trend research.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
