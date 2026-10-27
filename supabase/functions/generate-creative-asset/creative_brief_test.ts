import { assertEquals, assertStringIncludes } from 'jsr:@std/assert'
import { buildCreativeMediaPrompt, contentLanguage, CREATIVE_STAGES } from '../_shared/creativeBrief.ts'

const brand = { brand_name: 'Kopi Pagi', product: 'Kami menjual kopi susu gula aren untuk pekerja kantor', brand_message: 'Hangat dan ramah', brand_color: '#8C52FF' }
Deno.test('Indonesian owner details select Bahasa Indonesia', () => {
  assertEquals(contentLanguage(brand.product), 'Bahasa Indonesia')
  assertEquals(contentLanguage('Handmade silver jewellery for women'), 'the language of the owner’s product description')
})
Deno.test('video follows hook story product demonstration CTA with spoken lines and brand details', () => {
  assertEquals([...CREATIVE_STAGES], ['hook', 'story', 'product_demo', 'cta'])
  const prompt = buildCreativeMediaPrompt(brand, { hook: 'Butuh semangat pagi?', scenes: CREATIVE_STAGES.map((stage) => ({ stage, visual: `visual ${stage}`, voiceover: `ucapan ${stage}` })) }, 'video', 30)
  for (const text of [brand.brand_name, brand.product, brand.brand_message, brand.brand_color, 'Bahasa Indonesia', '0-6s HOOK', '6-13.5s STORY', '13.5-24s PRODUCT_DEMO', '24-30s CTA', 'ucapan product_demo', 'ucapan cta']) assertStringIncludes(prompt, text)
})
Deno.test('image preserves product and Bahasa text without treating it as a video', () => {
  const prompt = buildCreativeMediaPrompt(brand, { hook: 'Nikmati kopi pagi' }, 'image', 5)
  assertStringIncludes(prompt, brand.product)
  assertStringIncludes(prompt, 'Bahasa Indonesia')
  assertEquals(prompt.includes('0-1s HOOK'), false)
})