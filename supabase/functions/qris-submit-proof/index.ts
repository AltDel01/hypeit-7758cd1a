import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { serviceClient, notifyAdmin, formatIDR } from '../_shared/qris.ts'

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
    const { data: claims } = await authClient.auth.getClaims(authHeader.slice(7))
    const userId = claims?.claims?.sub as string | undefined
    if (!userId) return json({ error: 'Unauthorized.' }, 401)

    const body = (await req.json().catch(() => ({}))) as { orderId?: string; proofPath?: string }
    const orderId = (body.orderId || '').toString()
    const proofPath = (body.proofPath || '').toString().slice(0, 500)
    if (!orderId || !proofPath) return json({ error: 'Missing payment proof.' }, 400)
    if (!proofPath.startsWith(`proofs/${userId}/`)) return json({ error: 'Invalid file.' }, 400)

    const db = serviceClient()
    const { data: order, error } = await db
      .from('payment_orders')
      .update({ proof_url: proofPath, status: 'review' })
      .eq('id', orderId)
      .eq('user_id', userId)
      .in('status', ['pending', 'expired', 'review'])
      .select('*')
      .maybeSingle()

    if (error || !order) return json({ error: 'This order can no longer be updated.' }, 400)

    await notifyAdmin(
      `QRIS proof uploaded, ${formatIDR(order.unique_amount_idr)}`,
      `<p><b>${order.user_email ?? order.user_id}</b> uploaded proof for ${order.pack_name}.</p>
       <p>Amount: ${formatIDR(order.unique_amount_idr)} , Credits: ${order.credits}</p>
       <p><a href="https://viralin.ai/admin?tab=payments">Open the admin Payments tab</a> to approve or reject it.</p>`,
    )


    return json({ ok: true, order })
  } catch (e) {
    console.error('qris-submit-proof failed', (e as Error).message)
    return json({ error: 'Could not submit your proof.' }, 500)
  }
})
