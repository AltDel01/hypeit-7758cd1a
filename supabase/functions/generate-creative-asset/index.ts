import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { clampWanDuration, needsLongFormModel, WAN_LONGFORM_MODEL } from '../_shared/dashscope.ts'
import { notifyResultReady } from '../_shared/resultEmail.ts'
import { notifyAdminNewRequest } from '../_shared/notifyAdminNewRequest.ts'


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

    const body = (await req.json().catch(() => ({}))) as { dayId?: string; duration?: number | string }
    const dayId = (body.dayId || '').toString()
    const videoDuration = clampWanDuration(body.duration, 5)

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

    /* ---------------- VIDEO: generate automatically via Wan (DashScope) ---------------- */
    if (assetType === 'video') {
      const videoModel = needsLongFormModel(videoDuration) ? WAN_LONGFORM_MODEL : 'wan2.7-t2v'
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
          category: 'video-t2v',
          auto_provider: 'wan',
          auto_model: videoModel,
        })
        .select('id')
        .single()
      if (grErr || !gr) {
        console.error('video request insert failed', grErr)
        return json({ error: 'Could not start video generation.' }, 500)
      }

      notifyAdminNewRequest(admin, {
        userName: profile?.display_name,
        userEmail: profile?.email,
        requestType: 'video',
        prompt: basePrompt,
        aspectRatio: '9:16',
      })

      await admin
        .from('creative_days')
        .update({ request_id: gr.id, gen_stage: 'generating', status: 'Generating', credits_used: cost })
        .eq('id', dayId)

      // Submit to the provider right away so the request never sits in the
      // queue waiting for a human. wan-video authenticates the caller, so the
      // user's own Authorization header is forwarded.
      const dispatch = await fetch(`${supabaseUrl}/functions/v1/wan-video`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: gr.id,
          category: 'video-t2v',
          model: videoModel,
          prompt: basePrompt,
          resolution: '1080P',
          duration: videoDuration,
        }),
      }).catch((e) => {
        console.error('wan-video dispatch failed', e)
        return null
      })

      if (!dispatch || !dispatch.ok) {
        const detail = dispatch ? await dispatch.text().catch(() => '') : 'network error'
        console.error('wan-video dispatch rejected', dispatch?.status, detail.slice(0, 300))
        await admin
          .from('generation_requests')
          .update({
            auto_failed: true,
            status: 'new',
            failure_reason: 'Video generation could not be submitted to the provider. Please try again.',
          })
          .eq('id', gr.id)
        await admin
          .from('creative_days')
          .update({ gen_stage: 'idle', status: 'Draft' })
          .eq('id', dayId)
        return json({ error: 'Could not start video generation.' }, 502)
      }

      return json({ assetType: 'video', status: 'generating', requestId: gr.id })
    }

    /* ---------------- IMAGE: generate now via Qwen (DashScope) ---------------- */
    const qwenKey = Deno.env.get('QWEN_API_KEY')
    if (!qwenKey) {
      return json({ error: 'Image generation is not configured.' }, 500)
    }

    const imageModels = ['qwen-image-3.0-pro', 'qwen-image-plus', 'qwen-image']
    let remoteImageUrl: string | undefined
    let lastErr = ''

    for (const model of imageModels) {
      const res = await fetch(
        'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${qwenKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            input: { messages: [{ role: 'user', content: [{ text: basePrompt }] }] },
            parameters: { size: '928*1664', n: 1, prompt_extend: false },
          }),
        },
      )

      if (!res.ok) {
        lastErr = await res.text()
        console.error('qwen image error', model, res.status, lastErr.slice(0, 400))
        const t = lastErr.toLowerCase()
        const modelIssue =
          res.status === 403 || res.status === 404 ||
          t.includes('model not exist') || t.includes('unsupported model') ||
          t.includes('model not support') || t.includes('access denied')
        if (modelIssue) continue
        break
      }

      const data = await res.json()
      const choices = data?.output?.choices
      if (Array.isArray(choices)) {
        for (const choice of choices) {
          const parts = choice?.message?.content
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part?.image && !remoteImageUrl) remoteImageUrl = part.image
            }
          }
        }
      }
      if (!remoteImageUrl && Array.isArray(data?.output?.results)) {
        remoteImageUrl = data.output.results.find((r: { url?: string }) => r?.url)?.url
      }
      if (remoteImageUrl) {
        if (model !== imageModels[0]) console.warn('creative asset fell back to', model)
        break
      }
      console.error('qwen returned no image', JSON.stringify(data).slice(0, 400))
    }

    if (!remoteImageUrl) {
      return json({ error: 'Image generation failed.' }, 502)
    }

    const imgRes = await fetch(remoteImageUrl)
    if (!imgRes.ok) {
      console.error('image download failed', imgRes.status)
      return json({ error: 'Could not download the generated image.' }, 502)
    }
    const bytes = new Uint8Array(await imgRes.arrayBuffer())
    const path = `${userId}/creative/${dayId}-${Date.now()}.png`

    const { error: upErr } = await admin.storage
      .from('generated-images')
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (upErr) {
      console.error('upload failed', upErr)
      return json({ error: 'Could not save the generated image.' }, 500)
    }

    const assetRef = `storage:generated-images/${path}`

    // Record the finished image in the user's generation history
    const { data: imgReq } = await admin
      .from('generation_requests')
      .insert({
        user_id: userId,
        user_email: profile?.email || 'unknown@user',
        user_name: profile?.display_name || null,
        request_type: 'image',
        prompt: basePrompt,
        aspect_ratio: '9:16',
        status: 'completed',
        credits_used: cost,
        category: 'creative-workflow',
        result_url: assetRef,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle()

    if (imgReq?.id) {
      await notifyResultReady(admin, imgReq.id)
      await notifyAdminNewRequest(admin, {
        userName: profile?.display_name,
        userEmail: profile?.email,
        requestType: 'image',
        prompt: basePrompt,
        aspectRatio: '9:16',
      })
    }

    await admin
      .from('creative_days')
      .update({
        asset_url: assetRef,
        gen_stage: 'ready',
        credits_used: cost,
        ...(imgReq?.id ? { request_id: imgReq.id } : {}),
      })
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
