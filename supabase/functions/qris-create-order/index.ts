import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { serviceClient, expireStaleOrders } from '../_shared/qris.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !anonKey) {
      return json({ error: 'Unauthorized.' }, 401)
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(authHeader.slice(7))
    const userId = claims?.claims?.sub as string | undefined
    const userEmail = (claims?.claims?.email as string | undefined) ?? null
    if (claimsError || !userId) return json({ error: 'Unauthorized.' }, 401)

    const body = (await req.json().catch(() => ({}))) as { packKey?: string }
    const packKey = (body.packKey || '').toString().slice(0, 60)
    if (!packKey) return json({ error: 'A package is required.' }, 400)

    const db = serviceClient()
    await expireStaleOrders(db)

    const { data: pack } = await db
      .from('credit_packs')
      .select('*')
      .eq('key', packKey)
      .eq('active', true)
      .maybeSingle()
    if (!pack) return json({ error: 'That package is not available.' }, 400)

    const { data: settings } = await db.from('payment_settings').select('*').maybeSingle()
    if (!settings?.qris_image_url) {
      return json({ error: 'QRIS payment is not set up yet. Please contact support.' }, 503)
    }

    // Only one live order per user at a time.
    await db
      .from('payment_orders')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'pending')

    const ttl = Number(settings.order_ttl_minutes ?? 30)
    const base = Number(pack.price_idr)

    // A unique 3-digit suffix makes every live order's amount distinguishable
    // in the bank notification, which is what lets reconciliation be automatic.
    let created: any = null
    let lastError = ''
    for (let attempt = 0; attempt < 25 && !created; attempt++) {
      const suffix = Math.floor(Math.random() * 999) + 1
      const { data, error } = await db
        .from('payment_orders')
        .insert({
          user_id: userId,
          user_email: userEmail,
          pack_key: pack.key,
          pack_name: pack.name,
          credits: pack.credits,
          base_amount_idr: base,
          unique_amount_idr: base + suffix,
          expires_at: new Date(Date.now() + ttl * 60_000).toISOString(),
        })
        .select('*')
        .maybeSingle()
      if (data) created = data
      else lastError = error?.message ?? ''
    }

    if (!created) {
      console.error('could not allocate unique amount', lastError)
      return json({ error: 'Too many payments in progress. Please try again in a minute.' }, 503)
    }

    const { data: signed } = await db.storage
      .from('payment-assets')
      .createSignedUrl(settings.qris_image_url, 60 * 60)

    return json({
      order: created,
      qrisImageUrl: signed?.signedUrl ?? null,
      merchantName: settings.merchant_name,
      instructions: settings.instructions,
    })
  } catch (e) {
    console.error('qris-create-order failed', (e as Error).message)
    return json({ error: 'Could not start checkout. Please try again.' }, 500)
  }
})
