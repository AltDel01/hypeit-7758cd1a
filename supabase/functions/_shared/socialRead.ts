// Reads public social profiles (Instagram, TikTok, Facebook) so the AI can study real posts.
// Tries a direct page scrape first, then falls back to web search results about the account.
const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2'

type Social = { instagram?: string; tiktok?: string; facebook?: string }

const handleOf = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?[^/]+\//i, '').replace(/^@/, '').split(/[/?#]/)[0]

// When Firecrawl is out of credits or rate limited, skip it for a while so
// brand scans and strategies don't wait on calls that will fail anyway.
let pausedUntil = 0

async function fc(path: string, key: string, body: unknown, ms = 20000) {
  if (Date.now() < pausedUntil) return null
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(`${FIRECRAWL_V2}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      if (res.status === 402) pausedUntil = Date.now() + 10 * 60_000
      else if (res.status === 429) pausedUntil = Date.now() + 30_000
      console.error(`socialRead ${path} failed [${res.status}]: ${(await res.text()).slice(0, 300)}`)
      return null
    }
    return await res.json()
  } catch (e) {
    console.error(`socialRead ${path} error`, e)
    return null
  } finally {
    clearTimeout(t)
  }
}

const looksBlocked = (md: string) =>
  md.length < 300 || /log in|sign up to see|login to continue|masuk/i.test(md.slice(0, 600))

async function readOne(platform: string, url: string, key: string): Promise<string> {
  const handle = handleOf(url)
  // Instagram/TikTok/Facebook block direct page scraping, so read public post snippets via search.
  let text = ''

  if (!text) {
    const site = platform === 'facebook' ? 'facebook.com' : platform === 'tiktok' ? 'tiktok.com' : 'instagram.com'
    const found = await fc('search', key, { query: `site:${site} ${handle}`, limit: 8 })
    const items: Array<Record<string, string>> = found?.data?.web || found?.data || []
    const h = handle.toLowerCase()
    // Keep only results that belong to this exact account, so other similar accounts don't mislead the AI.
    text = (Array.isArray(items) ? items : [])
      .filter((r) => {
        const u = (r.url || '').toLowerCase().replace(/\/+$/, '')
        return u.includes(`/${h}/`) || u.endsWith(`/${h}`) || u.includes(`/@${h}`) || (r.title || '').toLowerCase().includes(`@${h})`)
      })
      .map((r) => `- ${r.title || ''}: ${r.description || ''}`)
      .join('\n')
      .slice(0, 2500)
  }
  return text ? `### ${platform} (@${handle})\n${text}` : ''
}

/** Returns readable text about the brand's recent social posts, or '' if nothing could be read. */
export async function readSocialProfiles(social: Social): Promise<string> {
  const key = Deno.env.get('FIRECRAWL_API_KEY')
  if (!key) return ''
  const entries = (Object.entries(social) as [string, string | undefined][])
    .filter(([, v]) => v && /^https?:\/\//i.test(v))
  const parts = await Promise.all(entries.map(([p, u]) => readOne(p, u as string, key)))
  return parts.filter(Boolean).join('\n\n')
}
