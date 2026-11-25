import { assertEquals } from 'jsr:@std/assert@1'
import { findBrandLogo, pickBrandColor } from './brandSite.ts'

Deno.test('brand color must be one of the real website colors', () => {
  assertEquals(pickBrandColor('#0047AB', ['#FFD700', '#036B32']), '#FFD700')
  assertEquals(pickBrandColor('#036b32', ['#FFD700', '#036B32']), '#036B32')
  assertEquals(pickBrandColor('#0047AB', []), '#0047AB')
})

Deno.test('logo falls back to Instagram when there is no website', async () => {
  const logo = await findBrandLogo({ social: { instagram: '@nike' } })
  assertEquals(!!logo && logo.includes('cdninstagram'), true)
})

Deno.test('logo falls back to TikTok profile', async () => {
  const logo = await findBrandLogo({ social: { tiktok: 'https://www.tiktok.com/@tiktok' } })
  assertEquals(!!logo, true)
})
