# QRIS: make receipt upload the main path (no bank emails needed)

Your QRIS account does not send transaction emails, so inbox matching cannot be the primary way to confirm payments. The plan switches the flow to: user pays, uploads the receipt, admin approves, credits land instantly and a receipt email is sent.

## The blocking bug

Once a user uploads proof, their order moves to status `review`. The approve and reject actions only accept orders in `pending` or `expired`, so every order with an uploaded receipt currently fails to approve. This is the first thing to fix.

## What changes

1. **Approval accepts `review` orders**
   - Settlement and rejection both allow `pending`, `expired`, and `review`.
   - Approving grants the pack credits and sends the buyer a confirmation email.

2. **Checkout copy leads with the receipt**
   - The upload block becomes the primary call to action: "Paid? Upload your receipt to get your credits."
   - Remove wording that promises automatic crediting within a few minutes.
   - After uploading, the dialog shows a clear "We are verifying your payment" state, and flips to "credits added" live when the admin approves.

3. **Admin Payments tab focused on proofs**
   - A "Needs review" group at the top listing orders with uploaded receipts, each with a thumbnail/preview link of the receipt (signed URL), buyer email, pack, exact amount, and Approve / Reject buttons.
   - Reject asks for a short reason, which is shown to the buyer and emailed to them.
   - The Gmail scan button and email-events table stay, but move to a collapsed "Optional: bank email matching" area, so nothing breaks if you later add a bank that does send emails.

4. **Notifications**
   - Admin already gets an email when a proof is uploaded, keep it and add a direct link to the admin Payments tab.
   - Buyer gets an email on approve (receipt) and on reject (reason + retry link).

5. **Orders don't die while waiting**
   - An expired order that has proof uploaded stays reviewable instead of being lost, so a slow approval never burns the buyer's payment.

## Technical notes

- `supabase/functions/_shared/qris.ts`: add `review` to the allowed status filter in `settleOrder`; add a `sendRejection` helper.
- `supabase/functions/qris-admin-order/index.ts`: include `review` in the reject status filter; send the rejection email.
- `src/components/payments/QrisCheckoutDialog.tsx`: reorder and reword the upload block; add rejected-state UI.
- `src/components/admin/AdminPaymentsSection.tsx`: needs-review group with signed receipt previews, reject-reason prompt, collapse the email section.
- No database schema changes needed.
