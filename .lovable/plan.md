# Make Connected Accounts look live

## What changes
- TikTok, Instagram and Facebook always show "Not connected" and an active **Connect** button. The "Coming soon" label and greyed-out buttons go away.
- Clicking Connect opens the real TikTok or Facebook login once your app keys are added.
- Until the keys are in, clicking Connect shows a friendly message instead: "We couldn't reach TikTok right now. Please try again in a few minutes." It doesn't mention "not available" or "coming soon".

## Important
Connecting can't actually work until you add your TikTok and Meta app keys. Until then, users can click but won't get connected. Send the keys whenever you're ready.

## Technical details
- `src/components/social/ConnectedAccounts.tsx`: ignore `configured` for the label and the button's disabled state. Change the `not_configured` error text to a friendly, temporary-sounding message.
- No changes to the edge functions.
