import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { serviceClient, expireStaleOrders, settleOrder, sendReceipt, notifyAdmin, formatIDR } from '../_shared/qris.ts'

const GATEWAY = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'

function decodeB64Url(data: string): string {
  try {
    const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

function collectText(payload: any): string {
  if (!payload) return ''
  let out = ''
  if (payload.body?.data) out += decodeB64Url(payload.body.data) + '\n'
  for (const part of payload.parts ?? []) out += collectText(part)
  return out
}

function stripHtml(input: string): string {
  return input.replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
}

/** Pulls every plausible Rupiah amount out of a bank notification. */
function extractAmounts(text: string): number[] {
  const found = new Set<number>()
  const patterns = [
    /(?:rp\.?|idr)\s*([0-9][0-9.,]{2,})/gi,
    /([0-9]{1,3}(?:[.,][0-9]{3})+)(?:[.,][0-9]{2})?/g,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const raw = m[1]
      // Drop a trailing ",00" / ".00" cents group, then remove all separators.
      const cleaned = raw.replace(/[.,]\d{2}$/, '').replace(/[^0-9]/g, '')
      const value = Number(cleaned)
      if (Number.isFinite(value) && value >= 1000 && value <= 100_000_000) found.add(value)
    }
  }
  return [...found]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const db = serviceClient()

    // Callable by the scheduler (shared key) or by a signed-in admin.
    const cronKey = req.headers.get('x-cron-key')
    let authorized = false
    if (cronKey) {
      const { data: stored } = await db
        .from('internal_keys')
        .select('value')
        .eq('key', 'qris_cron')
        .maybeSingle()
      authorized = !!stored?.value && stored.value === cronKey
    } else {
      const authHeader = req.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const authClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: authHeader } } },
        )
        const { data: claims } = await authClient.auth.getClaims(authHeader.slice(7))
        const userId = claims?.claims?.sub as string | undefined
        if (userId) {
          const { data: isAdmin } = await db.rpc('has_role', { _user_id: userId, _role: 'admin' })
          authorized = !!isAdmin
        }
      }
    }
    if (!authorized) return json({ error: 'Unauthorized.' }, 401)

    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const gmailKey = Deno.env.get('GOOGLE_MAIL_API_KEY')
    if (!lovableKey || !gmailKey) {
      return json({ error: 'Gmail reconciliation is not connected yet.' }, 503)
    }

    await expireStaleOrders(db)


    const { data: settings } = await db.from('payment_settings').select('*').maybeSingle()
    const senders: string[] = settings?.bank_senders ?? []
    if (senders.length === 0) {
      return json({ error: 'No bank sender addresses configured.' }, 400)
    }

    const gmailFetch = (path: string) =>
      fetch(`${GATEWAY}${path}`, {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': gmailKey,
        },
      })

    const query = `newer_than:2d (${senders.map((s) => `from:${s}`).join(' OR ')})`
    const listRes = await gmailFetch(`/users/me/messages?maxResults=25&q=${encodeURIComponent(query)}`)
    if (!listRes.ok) {
      const details = await listRes.text()
      console.error(`gmail list failed [${listRes.status}]: ${details}`)
      return json({ error: 'Could not read bank emails.', status: listRes.status, details }, listRes.status)
    }
    const list = await listRes.json()
    const messages: Array<{ id: string }> = list.messages ?? []

    let scanned = 0
    let matched = 0
    const results: Array<Record<string, unknown>> = []

    for (const msg of messages) {
      const { data: seen } = await db
        .from('payment_email_events')
        .select('id')
        .eq('provider_message_id', msg.id)
        .maybeSingle()
      if (seen) continue

      const detailRes = await gmailFetch(`/users/me/messages/${msg.id}?format=full`)
      if (!detailRes.ok) {
        console.error(`gmail get failed [${detailRes.status}]: ${await detailRes.text()}`)
        continue
      }
      const detail = await detailRes.json()
      scanned++

      const headers: Array<{ name: string; value: string }> = detail.payload?.headers ?? []
      const header = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
      const bodyText = stripHtml(collectText(detail.payload))
      const haystack = `${header('Subject')} ${detail.snippet ?? ''} ${bodyText}`
      const amounts = extractAmounts(haystack)

      // Find a live order whose unique amount appears in this email.
      let order: any = null
      if (amounts.length > 0) {
        const { data: candidates } = await db
          .from('payment_orders')
          .select('*')
          .in('status', ['pending', 'expired'])
          .in('unique_amount_idr', amounts)
          .order('created_at', { ascending: false })
          .limit(1)
        order = candidates?.[0] ?? null
      }

      const receivedAt = detail.internalDate
        ? new Date(Number(detail.internalDate)).toISOString()
        : new Date().toISOString()

      const { data: event } = await db
        .from('payment_email_events')
        .insert({
          provider_message_id: msg.id,
          sender: header('From').slice(0, 300),
          subject: header('Subject').slice(0, 300),
          snippet: (detail.snippet ?? '').slice(0, 500),
          amount_idr: amounts[0] ?? null,
          received_at: receivedAt,
          matched_order_id: order?.id ?? null,
          status: order ? 'matched' : 'unmatched',
          note: amounts.length ? `Amounts seen: ${amounts.join(', ')}` : 'No amount found',
        })
        .select('id')
        .maybeSingle()

      if (order) {
        const settled = await settleOrder(db, order.id, { matched_email_id: event?.id ?? null })
        if (settled.ok) {
          matched++
          await sendReceipt(settled.order, settled.order?.profile?.email)
          results.push({ orderId: order.id, amount: order.unique_amount_idr, credited: order.credits })
        } else {
          console.error('settle failed', settled.reason)
        }
      } else if (amounts.length > 0) {
        await notifyAdmin(
          'QRIS payment received but no matching order',
          `<p>A bank email arrived with amount ${formatIDR(amounts[0])} but no pending order matched.</p>
           <p>Subject: ${header('Subject')}</p>
           <p>Review it in the admin Payments tab.</p>`,
        )
      }
    }

    return json({ ok: true, scanned, matched, results })
  } catch (e) {
    console.error('qris-reconcile failed', (e as Error).message)
    return json({ error: 'Reconciliation failed.' }, 500)
  }
})
