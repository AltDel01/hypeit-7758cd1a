# Temporarily turn off email verification at signup

## What you do (about 1 minute)
1. Open your Supabase dashboard, then go to **Authentication > Sign In / Providers > Email**.
2. Switch **Confirm email** OFF and click **Save**.

New signups will be signed in right away and land in the app. No website change is needed. The signup page already handles both cases: when verification is off it signs the user in, and when it's on it shows "Check your email".

## What I do after you switch it off
- Sign up with a test email in the preview to confirm it goes straight in, with no "Check your email" screen.
- Check that the new-signup alert email still reaches you. That alert comes from the server, so it works either way.
- Update the project notes so they say verification is currently off.

## Good to know
- Anyone already stuck in "waiting for verification" stays unverified. Tell me if you want me to mark those accounts as verified.
- To turn verification back on later, switch **Confirm email** back ON. The "Check your email" flow comes back automatically.
