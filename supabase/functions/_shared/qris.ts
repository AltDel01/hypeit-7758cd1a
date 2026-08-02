// Shared helpers for the QRIS manual-payment flow.
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

export function formatIDR(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

/** Expire pending orders whose window has passed. Frees up their unique amount. */
export async function expireStaleOrders(db: SupabaseClient) {
  const { error } = await db
    .from('payment_orders')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
  if (error) console.error('expireStaleOrders failed', error.message)
}

/**
 * Marks an order paid and grants its credits. Idempotent: a second call for the
 * same order is a no-op because the status filter no longer matches.
 */
export async function settleOrder(
  db: SupabaseClient,
  orderId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; order?: any; reason?: string }> {
  const { data: order, error } = await db
    .from('payment_orders')
    .update({ status: 'paid', matched_at: new Date().toISOString(), ...patch })
    .eq('id', orderId)
    .in('status', ['pending', 'expired'])
    .select('*')
    .maybeSingle()

  if (error) return { ok: false, reason: error.message }
  if (!order) return { ok: false, reason: 'Order was already settled or does not exist.' }

  const { data: profile } = await db
    .from('profiles')
    .select('bonus_credits, email, display_name')
    .eq('id', order.user_id)
    .maybeSingle()

  const current = Number(profile?.bonus_credits ?? 0)
  const { error: creditError } = await db
    .from('profiles')
    .update({ bonus_credits: current + Number(order.credits) })
    .eq('id', order.user_id)

  if (creditError) {
    console.error('credit grant failed', creditError.message)
    return { ok: false, reason: 'Credits could not be granted.' }
  }

  return { ok: true, order: { ...order, profile } }
}

/** Sends the buyer a receipt. Never throws. */
export async function sendReceipt(order: any, toEmail?: string | null) {
  const key = Deno.env.get('RESEND_API_KEY')
  const to = toEmail || order?.user_email
  if (!key || !to) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'Viralin AI <hello@viralin.ai>',
        to: [to],
        subject: `Payment confirmed, ${order.credits.toLocaleString('en-US')} credits added`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;background:#0d0d12;padding:32px;color:#fff">
            <h2 style="color:#8C52FF;margin:0 0 16px">Payment confirmed</h2>
            <p style="color:#d5d5e0;margin:0 0 12px">Thanks, we received your QRIS payment.</p>
            <table style="color:#d5d5e0;font-size:14px">
              <tr><td style="padding:4px 16px 4px 0">Package</td><td><b>${order.pack_name}</b></td></tr>
              <tr><td style="padding:4px 16px 4px 0">Amount</td><td><b>${formatIDR(order.unique_amount_idr)}</b></td></tr>
              <tr><td style="padding:4px 16px 4px 0">Credits added</td><td><b>${order.credits.toLocaleString('en-US')}</b></td></tr>
              <tr><td style="padding:4px 16px 4px 0">Order</td><td>${order.id}</td></tr>
            </table>
            <p style="color:#8b8b9a;font-size:12px;margin-top:24px">Your credits are available right now in your dashboard.</p>
          </div>`,
      }),
    })
  } catch (e) {
    console.error('receipt email failed', (e as Error).message)
  }
}

/** Alerts the admin about something needing manual attention. Never throws. */
export async function notifyAdmin(subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'Viralin AI <hello@viralin.ai>',
        to: ['eka@viralin.ai'],
        subject,
        html,
      }),
    })
  } catch (e) {
    console.error('admin email failed', (e as Error).message)
  }
}
