# QRIS Payments with Automatic Email Reconciliation

Sell credit top-ups with your own static QRIS code, no payment gateway. Confirmation is automated by an agent that reads your bank/e-wallet notification emails and matches each payment by its unique amount.

## How it works

```text
User (Indonesia) sees IDR pricing
      -> picks a credit pack -> order created with a UNIQUE amount
         e.g. pack Rp 149.000 becomes Rp 149.327
      -> QRIS image + amount + 30 min countdown shown
      -> user scans, pays exact amount

Bank / QRIS merchant app emails you "Dana masuk Rp 149.327"
      -> that mailbox is polled every minute
      -> AI parses amount + time from the email
      -> matched to the pending order with that exact amount
      -> credits granted instantly, receipt emailed to the user
      -> no match? order stays pending, lands in the admin queue
```

Why unique amounts: a static QRIS gives no order reference, so the amount itself becomes the reference. Adding a random 3-digit suffix (0 to 999) makes each pending order distinguishable.

## Requirements you must provide

1. Your static QRIS image (PNG/JPG) to display at checkout.
2. A mailbox that receives payment notifications from your bank or QRIS merchant app, and turning those notifications on. This will be connected to the app via the Gmail connector (read-only). If your bank only sends SMS, email automation cannot work and it falls back to manual approval.
3. IDR prices for each pack.

## What gets built

**1. Database**
- `payment_orders`: user_id, pack key, base amount, unique amount (unique among pending), credits, status (`pending` / `paid` / `expired` / `rejected`), matched email reference, expires_at, timestamps. RLS: users see only their own; only edge functions write status.
- `payment_email_events`: raw parsed bank emails (message id, amount, received time, matched order) so nothing is processed twice and you have an audit trail.
- Credits are granted only by a service-role edge function, never by the client.

**2. Checkout UI**
- Indonesian visitors (timezone/locale detection, with a manual currency toggle) see IDR prices and a "Pay with QRIS" button on the pricing page and in the upgrade dialog.
- QRIS dialog: QR image, exact amount with copy button, countdown, live status that flips to "Payment confirmed" the moment reconciliation succeeds (Supabase realtime).
- Optional proof upload as a backup path if the email match is delayed.

**3. Reconciliation agent (automated)**
- Gmail connector reads only messages from your bank sender.
- Cron job (every minute) runs an edge function: fetch new notification emails, extract amount, time and sender using the AI gateway with structured output (handles any bank's wording), match to a pending order with the same unique amount, mark it paid, add credits, email the receipt.
- Safety rails: amount must match exactly, order must be unexpired, each email consumed once, no partial matches, ambiguous or unmatched emails flagged for review.
- Orders past their window auto-expire and free up the amount suffix.

**4. Admin fallback (`/admin`)**
- Payments tab: pending, paid, unmatched emails. Manual "Approve" and "Reject" for anything the agent could not match, plus a full audit log of granted credits.

## Technical notes

- Gmail access via the gateway-enabled Gmail connector using read-only scope; polled from a Supabase edge function on `pg_cron`, following the existing `wan-video-cron` pattern.
- Email parsing uses the Lovable AI Gateway with a small structured-output schema, so it works across BCA, Mandiri, BRI, GoPay, OVO, Dana wording without hardcoded regex.
- Credit grants reuse the existing `profiles.bonus_credits` / tier fields so the rest of the app needs no change.
- Receipt and admin alerts go out through the existing Resend setup.

## Honest caveats

- A static QRIS is a personal or merchant QR, not a gateway: there is no signed webhook, so email matching is best-effort automation on top of a manual process. The admin queue stays as the safety net.
- Email notifications can be delayed by a few minutes; the UI communicates "waiting for confirmation" rather than promising instant.
- No automatic refunds or chargebacks; refunds are handled manually.
- Recurring billing is not possible; each top-up is a fresh payment (matches your one-time top-up choice).
