import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { serviceClient, settleOrder, sendReceipt, sendRejection } from '../_shared/qris.ts'

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

    const db = serviceClient()
    const { data: isAdmin } = await db.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) return json({ error: 'Forbidden.' }, 403)

    const body = (await req.json().catch(() => ({}))) as {
      action?: string
      orderId?: string
      reason?: string
    }
    const orderId = (body.orderId || '').toString()
    if (!orderId) return json({ error: 'An order is required.' }, 400)

    if (body.action === 'approve') {
      const settled = await settleOrder(db, orderId, { approved_by: userId })
      if (!settled.ok) return json({ error: settled.reason ?? 'Could not approve.' }, 400)
      await sendReceipt(settled.order, settled.order?.profile?.email)
      return json({ ok: true, order: settled.order })
    }

    if (body.action === 'reject') {
      const reason = (body.reason || 'Payment could not be verified.').toString().slice(0, 300)
      const { data, error } = await db
        .from('payment_orders')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approved_by: userId,
        })
        .eq('id', orderId)
        .in('status', ['pending', 'expired', 'review'])
        .select('*')
        .maybeSingle()
      if (error || !data) return json({ error: 'Could not reject this order.' }, 400)
      await sendRejection(data, reason, data.user_email)
      return json({ ok: true, order: data })
    }


    return json({ error: 'Unknown action.' }, 400)
  } catch (e) {
    console.error('qris-admin-order failed', (e as Error).message)
    return json({ error: 'Action failed.' }, 500)
  }
})
