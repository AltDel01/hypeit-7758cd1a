import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { callQwen } from '../_shared/qwen.ts'
import { CREATIVE_STAGES, languageInstruction } from '../_shared/creativeBrief.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const json = (error: string, status: number) => new Response(JSON.stringify({ error }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !anonKey) return json('Unauthorized.', 401)
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: claims, error: authError } = await authClient.auth.getClaims(authHeader.slice(7))
    const userId = claims?.claims?.sub
    if (authError || !userId) return json('Unauthorized.', 401)
    if (!serviceKey) return json('Script generation is not configured.', 500)
    const apiKey = Deno.env.get('QWEN_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as { dayId?: string; concept?: string }
    const dayId = (body.dayId || '').toString()
    if (!dayId) {
      return new Response(JSON.stringify({ error: 'Missing day id.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Load the day + its strategy for brand context.
    const { data: day, error: dErr } = await supabase
      .from('creative_days')
      .select('id, concept, strategy_id')
      .eq('id', dayId)
      .eq('user_id', userId)
      .maybeSingle()
    if (dErr || !day) {
      return new Response(JSON.stringify({ error: 'Day not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const concept = (body.concept || day.concept || '').toString().slice(0, 200)
    if (!concept.trim()) {
      return new Response(JSON.stringify({ error: 'Add a concept name first so we know what to write about.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: strat } = await supabase
      .from('creative_strategies')
      .select('brand_name, product, brand_message, brand_color')
      .eq('id', day.strategy_id)
      .eq('user_id', userId)
      .maybeSingle()

    const brandName = (strat?.brand_name || '').toString().slice(0, 200)
    const productDesc = (strat?.product || '').toString().slice(0, 2000)
    const brandMessage = (strat?.brand_message || '').toString().slice(0, 300)

    const prompt = `You are a senior short-form social media scriptwriter. Write one scroll-stopping vertical video/carousel script for the concept below.
${languageInstruction(productDesc)}

Brand name: ${brandName || 'the brand'}
What they sell: ${productDesc || 'not specified'}
Brand voice/tone: ${brandMessage || 'infer a fitting tone'}
Content concept: ${concept}

Return ONLY a JSON object (no markdown) shaped exactly as:
{
  "hook": "scroll-stopping first line spoken/shown on screen (max 90 chars)",
  "body": "one sentence describing the visual treatment and pacing (max 160 chars)",
  "scenes": [
    { "stage": "hook|story|product_demo|cta", "visual": "concrete visual direction with product action, camera and lighting", "voiceover": "concise spoken line in the owner's language" }
  ]
}
Provide exactly 4 scenes in order: hook, story, product_demo, cta. Show the actual product in use in scene 3; end with an explicit relevant CTA in scene 4. Do not invent product benefits or offers.`

    const aiRes = await callQwen({
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
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
      return new Response(JSON.stringify({ error: 'Script generation failed.' }), {
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

    const rawScenes = Array.isArray(parsed.scenes) ? (parsed.scenes as Array<Record<string, unknown>>) : []
    if (rawScenes.length !== 4 || rawScenes.some((s) => !s.visual || !s.voiceover)) return json('The script was incomplete. Please generate it again.', 502)
    const scenes = CREATIVE_STAGES.map((stage, si) => {
      const s = rawScenes[si] || {}
      return {
        stage,
        visual: (s.visual || '').toString().slice(0, 400),
        voiceover: (s.voiceover || '').toString().slice(0, 400),
      }
    })
    const hook = (parsed.hook || '').toString().slice(0, 120)
    const bodyText = (parsed.body || '').toString().slice(0, 220)

    // Persist the generated script back to the day.
    const { error: uErr } = await supabase
      .from('creative_days')
      .update({ hook, body: bodyText, scenes })
      .eq('id', dayId)
    if (uErr) console.error('persist script failed', uErr)

    return new Response(JSON.stringify({ hook, body: bodyText, scenes }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('generate-day-script error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error during script generation.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
