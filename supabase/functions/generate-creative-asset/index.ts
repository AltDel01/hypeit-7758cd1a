import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const IMAGE_COST = 30
const VIDEO_COST = 50

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const apiKey = Deno.env.get('LOVABLE_API_KEY')

    // Identify the caller
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token)
    const userId = claimsData?.claims?.sub as string | undefined
    if (claimsError || !userId) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const body = (await req.json().catch(() => ({}))) as { dayId?: string }
    const dayId = (body.dayId || '').toString()
    if (!dayId) {
      return json({ error: 'A day is required.' }, 400)
    }

    const admin = createClient(supabaseUrl, serviceKey)

    // Load the day and verify ownership
    const { data: day, error: dayErr } = await admin
      .from('creative_days')
      .select('id, user_id, day, concept, hook, body, scenes, asset_type')
      .eq('id', dayId)
      .maybeSingle()
    if (dayErr || !day) {
      return json({ error: 'Content day not found.' }, 404)
    }
    if (day.user_id !== userId) {
      return json({ error: 'Forbidden' }, 403)
    }

    const assetType = day.asset_type === 'video' ? 'video' : 'image'
    const cost = assetType === 'video' ? VIDEO_COST : IMAGE_COST

    // Check the user's remaining credits
    const { data: profile } = await admin
      .from('profiles')
      .select('email, display_name, generations_this_month, monthly_generation_limit, bonus_credits')
      .eq('id', userId)
      .maybeSingle()

    const used = profile?.generations_this_month || 0
    const limit = profile?.monthly_generation_limit ?? 500
    const bonus = profile?.bonus_credits || 0
    const remaining = Math.max(0, limit - used + bonus)
    if (cost > remaining) {
      return json(
        { error: `Not enough credits. This needs ${cost}, you have ${remaining}.`, code: 'insufficient_credits' },
        402,
      )
    }

    const scenes = Array.isArray(day.scenes) ? (day.scenes as Array<{ visual?: string; voiceover?: string }>) : []
    const sceneText = scenes.map((s, i) => `Scene ${i + 1}: ${s.visual || ''}`).join('. ')
    const basePrompt = `Vertical 9:16 social media ${assetType} for "${day.concept}". Hook: ${day.hook}. ${day.body}. ${sceneText}. Polished, scroll-stopping, high quality.`

    /* ---------------- VIDEO: route to editor fulfillment pipeline ---------------- */
    if (assetType === 'video') {
      const { data: gr, error: grErr } = await admin
        .from('generation_requests')
        .insert({
          user_id: userId,
          user_email: profile?.email || 'unknown@user',
          user_name: profile?.display_name || null,
          request_type: 'video',
          prompt: basePrompt,
          aspect_ratio: '9:16',
          status: 'new',
          credits_used: cost,
          category: 'creative-workflow',
        })
        .select('id')
        .single()
      if (grErr || !gr) {
        console.error('video request insert failed', grErr)
        return json({ error: 'Could not start video generation.' }, 500)
      }

      await admin
        .from('creative_days')
        .update({ request_id: gr.id, gen_stage: 'generating', status: 'Generating', credits_used: cost })
        .eq('id', dayId)

      return json({ assetType: 'video', status: 'generating', requestId: gr.id })
    }

    /* ---------------- IMAGE: generate now via Lovable AI ---------------- */
    if (!apiKey) {
      return json({ error: 'AI is not configured.' }, 500)
    }

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: basePrompt }],
        modalities: ['image', 'text'],
      }),
    })

    if (aiRes.status === 429) return json({ error: 'Too many requests, try again shortly.' }, 429)
    if (aiRes.status === 402) return json({ error: 'AI credits exhausted.' }, 402)
    if (!aiRes.ok) {
      console.error('image gen error', aiRes.status, await aiRes.text())
      return json({ error: 'Image generation failed.' }, 502)
    }

    const aiData = await aiRes.json()
    const imageUrl: string | undefined =
      aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url
    if (!imageUrl || !imageUrl.startsWith('data:')) {
      console.error('no image returned', JSON.stringify(aiData).slice(0, 500))
      return json({ error: 'Image generation returned no image.' }, 502)
    }

    // Decode the data URL
    const [, base64] = imageUrl.split(',')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const path = `${userId}/creative/${dayId}-${Date.now()}.png`

    const { error: upErr } = await admin.storage
      .from('generated-images')
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (upErr) {
      console.error('upload failed', upErr)
      return json({ error: 'Could not save the generated image.' }, 500)
    }

    const assetRef = `storage:generated-images/${path}`

    await admin
      .from('creative_days')
      .update({ asset_url: assetRef, gen_stage: 'ready', credits_used: cost })
      .eq('id', dayId)

    // Deduct credits on successful image generation
    await admin
      .from('profiles')
      .update({ generations_this_month: used + cost })
      .eq('id', userId)

    return json({ assetType: 'image', status: 'ready', assetUrl: assetRef, creditsUsed: cost })
  } catch (e) {
    console.error('generate-creative-asset error', e)
    return json({ error: 'Unexpected error during generation.' }, 500)
  }
})
