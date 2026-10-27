import { assert, assertEquals } from 'jsr:@std/assert'

const URL = 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/generate-strategy'

Deno.test('rejects unauthenticated callers', async () => {
  const res = await fetch(URL, { method: 'POST', body: '{}' })
  await res.body?.cancel()
  assertEquals(res.status, 401)
})

const token = Deno.env.get('TEST_ACCESS_TOKEN')
Deno.test({
  name: 'builds a 7-day plan grounded in the brand',
  ignore: !token,
  fn: async () => {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName: 'Kopi Pagi', product: 'Kami menjual kopi susu gula aren untuk pekerja kantor di Jakarta. Rasanya lembut dan dibuat segar setiap pagi.' }),
    })
    const data = await res.json()
    assertEquals(res.status, 200)
    assertEquals(data.days.length, 7)
    assertEquals(data.days[0].day, 'Day-1')
    assert(data.days.every((d: { hook: string }) => d.hook.length > 0))
    assertEquals(data.analysis.language, 'Bahasa Indonesia')
    for (const day of data.days) {
      assertEquals(day.scenes.map((s: { stage: string }) => s.stage), ['hook', 'story', 'product_demo', 'cta'])
      assert(day.scenes.every((s: { visual: string; voiceover: string }) => s.visual.trim() && s.voiceover.trim()))
    }
    console.log(JSON.stringify({ analysis: data.analysis, usedWebsite: data.usedWebsite, day1: data.days[0] }, null, 1))
  },
})
