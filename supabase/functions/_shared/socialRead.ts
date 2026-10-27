// Reads public social profiles (Instagram, TikTok, Facebook) so the AI can study real posts.
// Tries a direct page scrape first, then falls back to web search results about the account.
const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2'

type Social = { instagram?: string; tiktok?: string; facebook?: string }

const handleOf = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?[^/]+\//i, '').replace(/^@/, '').split(/[/?#]/)[0]

async function fc(path: string, key: string, body: unknown, ms = 20000) {
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
  const scraped = await fc('scrape', key, { url, formats: ['markdown'], onlyMainContent: true, waitFor: 2500 })
  const md: string = scraped?.data?.markdown || scraped?.markdown || ''
  let text = md && !looksBlocked(md) ? md.slice(0, 3500) : ''

  if (!text) {
    const site = platform === 'facebook' ? 'facebook.com' : platform === 'tiktok' ? 'tiktok.com' : 'instagram.com'
    const found = await fc('search', key, { query: `site:${site} ${handle}`, limit: 6 })
    const items: Array<Record<string, string>> = found?.data?.web || found?.data || []
    text = (Array.isArray(items) ? items : [])
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
