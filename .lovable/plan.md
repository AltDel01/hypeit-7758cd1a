# Require email verification before an account is active

Today, signing up logs the person in immediately because auto-confirm is on. After this change, a new signup sends a verification link to the address they typed, and the account only becomes usable after they click it.

## What the user will experience

1. Fills in name, email, password on the sign-up page.
2. Instead of landing in the dashboard, they see a "Check your email" screen with the address shown, plus a "Resend email" button (60-second cooldown).
3. The email contains a link back to the site that confirms the address and signs them in.
4. If they try to log in before confirming, they get a clear message: "Please verify your email first," with a button to resend the link.

## Changes

- **Turn off auto-confirm** so Supabase sends the confirmation email on signup.
- **Sign-up page**: after a successful submit, switch to the pending-confirmation state rather than redirecting. Treat "already registered" gracefully.
- **Sign-up logic**: keep `emailRedirectTo` pointing at the site, stop treating signup as a logged-in state, and add a resend action.
- **Login page**: detect the unconfirmed-email error and show the friendly message plus resend option.
- **Confirmation landing**: handle the returning link so the person ends up signed in on the dashboard, with a short "Email verified" confirmation.

## Technical notes

- `configure_auth` with `auto_confirm_email: false`.
- `AuthContext.signUp` currently writes referral links (`profiles.referred_by`, `referrals`, bonus credits) right after `signUp()` using `data.user`. With confirmation required there is no session at that moment, so those writes will fail under RLS. Move referral attribution to a `SECURITY DEFINER` database trigger on new-profile creation, reading `raw_user_meta_data->>'referral_code'` (already passed in signup metadata). No new tables; the trigger reuses the existing `profiles` / `referrals` logic.
- Resend via `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo } })`.
- Login error detection: Supabase returns `email_not_confirmed`.
- The existing `onAuthStateChange` listener already handles the session arriving after the link is clicked; the confirmation route just needs a friendly message.

## Not included

- Custom-branded auth email templates (default Lovable auth email is used). Can be added later if you want it styled with the Viralin look.
