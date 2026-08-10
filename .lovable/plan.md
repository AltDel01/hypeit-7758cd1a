# Set up the QRIS code for checkout

Right now no QR is stored, so checkout returns "QRIS payment is not set up yet."

## What happens once you attach the QR image in chat

1. Upload the image to the private `payment-assets` storage bucket at `qris/qris-code.<ext>`.
2. Write the payment settings row: `qris_image_url` set to that path, plus your merchant name and the checkout instructions text.
3. Verify by opening the checkout dialog from the pricing page and confirming the QR renders (it is served through a short-lived signed URL) and the unique amount shows.

## What I need from you

- The QRIS image file (PNG or JPG), attached in chat.
- The merchant name exactly as it appears in the QR (shown to buyers so they can confirm before paying).
- Optional: any extra instruction line you want under the QR.

You can also do all of this yourself later at /admin, Payments tab: upload the QRIS image, set the merchant name, then Save settings.

## Technical notes

- No schema or code changes; this only fills `payment_settings` (single row) and adds one storage object.
- `qris-create-order` already reads `payment_settings.qris_image_url` and signs it for one hour, so nothing else needs touching.
