// Reads brand assets (logo, colors, text) from a website's HTML.
export interface BrandSite { text: string; logoUrl: string | null; colors: string[] }

const abs = (u: string, base: string) => { try { return new URL(u.replace(/&amp;/g, '&'), base).href } catch { return null } }
const usable = (u: string | null) => !!u && /^https?:\/\//.test(u) && !/\.(svg|ico)(\?|#|$)/i.test(u) && !u.startsWith('data:')
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1] || ''

function isNeutral(hex: string) {
  const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  return max - min < 28 || max < 30 || min > 235
}

export function extractBrandAssets(html: string, baseUrl: string): BrandSite {
  // Logo: an <img> that names itself a logo, then the touch icon, then a PNG icon, then the share image.
  const candidates: string[] = []
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]
    if (/logo/i.test(attr(tag, 'src') + attr(tag, 'alt') + attr(tag, 'class') + attr(tag, 'id'))) {
      const src = attr(tag, 'src') || attr(tag, 'data-src'); const u = src && abs(src, baseUrl); if (u) candidates.push(u)
    }
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], 'rel').toLowerCase(); const u = abs(attr(m[0], 'href'), baseUrl)
    if (u && rel.includes('apple-touch-icon')) candidates.push(u)
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], 'rel').toLowerCase(); const u = abs(attr(m[0], 'href'), baseUrl)
    if (u && /\bicon\b/.test(rel)) candidates.push(u)
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/og:logo/i.test(attr(m[0], 'property'))) { const u = abs(attr(m[0], 'content'), baseUrl); if (u) candidates.unshift(u) }
  }
  const logoUrl = candidates.find(usable) || null

  // Colors: theme-color first, then the most used non-neutral hex colors in the page styles.
  const colors: string[] = []
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/theme-color|msapplication-TileColor/i.test(attr(m[0], 'name'))) {
      const c = attr(m[0], 'content'); if (/^#[0-9a-f]{6}$/i.test(c) && !isNeutral(c)) colors.push(c.toUpperCase())
    }
  }
  const counts = new Map<string, number>()
  for (const m of html.matchAll(/#([0-9a-f]{6})\b/gi)) {
    const c = `#${m[1].toUpperCase()}`; if (!isNeutral(c)) counts.set(c, (counts.get(c) || 0) + 1)
  }
  for (const [c] of [...counts].sort((a, b) => b[1] - a[1])) if (!colors.includes(c)) colors.push(c)

  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 6000)
  return { text, logoUrl, colors: colors.slice(0, 5) }
}

export async function fetchBrandSite(url: string): Promise<BrandSite> {
  const empty = { text: '', logoUrl: null, colors: [] }
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(normalized, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandScan/1.0)' }, signal: ctrl.signal })
    clearTimeout(t)
    if (!res.ok) return empty
    return extractBrandAssets(await res.text(), res.url || normalized)
  } catch { return empty }
}

/** Only keep a logo the generators can actually read (a public raster image). */
export async function checkLogo(url: string | null | undefined): Promise<string | null> {
  if (!url || !usable(url)) return null
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } })
    clearTimeout(t)
    const type = res.headers.get('content-type') || ''
    await res.body?.cancel()
    return res.ok && /image\/(png|jpe?g|webp)/i.test(type) ? url : null
  } catch { return null }
}

const handleOf = (v: string, host: string) => {
  const s = v.trim(); if (!s) return ''
  if (!/^https?:|\./.test(s)) return s.replace(/^@/, '')
  const m = s.match(new RegExp(`${host}\\.com/@?([A-Za-z0-9._-]+)`, 'i')); return m?.[1] || ''
}

/** Profile picture / share image of a public profile or shop page (og:image). */
async function pageImage(url: string): Promise<string | null> {
  try {
    const u = url.startsWith('http') ? url : `https://${url}`
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; facebookexternalhit/1.1)' }, signal: ctrl.signal })
    clearTimeout(t)
    if (!res.ok) return null
    const html = await res.text()
    for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
      if (/^(og:image|twitter:image)$/i.test(attr(m[0], 'property') || attr(m[0], 'name'))) {
        const img = abs(attr(m[0], 'content'), res.url || u); if (img) return img
      }
    }
  } catch { /* ignore */ }
  return null
}

export interface LogoSources {
  siteLogo?: string | null
  social?: { instagram?: string; tiktok?: string; facebook?: string }
  ecommerce?: { tiktokshop?: string; shopee?: string; tokopedia?: string }
}

/** Ordered list of places a logo can come from: website, Instagram, TikTok, Facebook, then shops. */
export function logoCandidates(src: LogoSources): (() => Promise<string | null>)[] {
  const out: (() => Promise<string | null>)[] = []
  if (src.siteLogo) out.push(async () => src.siteLogo!)
  const ig = handleOf(src.social?.instagram || '', 'instagram')
  if (ig) out.push(() => pageImage(`https://www.instagram.com/${ig}/`))
  const tt = handleOf(src.social?.tiktok || '', 'tiktok')
  if (tt) out.push(() => pageImage(`https://www.tiktok.com/@${tt}`), async () => `https://unavatar.io/tiktok/${tt}?fallback=false`)
  const fb = (src.social?.facebook || '').trim()
  if (fb) out.push(() => pageImage(/^https?:|\./.test(fb) ? fb : `https://www.facebook.com/${fb.replace(/^@/, '')}`))
  for (const shop of [src.ecommerce?.tiktokshop, src.ecommerce?.shopee, src.ecommerce?.tokopedia]) {
    if (shop?.trim()) out.push(() => pageImage(shop.trim()))
  }
  return out
}

/** First logo from any source that is a real readable image. */
export async function findBrandLogo(src: LogoSources): Promise<string | null> {
  for (const get of logoCandidates(src)) {
    const ok = await checkLogo(await get().catch(() => null))
    if (ok) return ok
  }
  return null
}

/** Keep the AI's color only if it is one of the colors really found; otherwise the most used one. */
export function pickBrandColor(aiColor: string, siteColors: string[], fallback = '#8C52FF'): string {
  const c = (aiColor || '').trim().toUpperCase()
  if (siteColors.length) return siteColors.includes(c) ? c : siteColors[0]
  return /^#[0-9A-F]{6}$/.test(c) ? c : fallback
}
