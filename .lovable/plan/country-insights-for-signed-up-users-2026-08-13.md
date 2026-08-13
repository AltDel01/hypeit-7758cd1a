# Country insights for signed-up users

Today the only country data is site-visitor analytics (Indonesia, Brazil, US, Thailand top the last 30 days). The database stores no country per user, so we add that and surface it in the admin dashboard.

## What gets built

1. **Capture country on signup**
   - When a new account is created, the app looks up the visitor's country (IP-based, same free lookup already used on the pricing page) and saves the two-letter country code plus a readable name on their profile.
   - Also captured on next sign-in for existing users whose country is still empty, so the data backfills naturally over time.
   - Silent and non-blocking: if the lookup fails, signup still succeeds and country stays empty.

2. **Countries panel in /admin**
   - New "Countries" tab in the admin dashboard showing:
     - Total users with a known country and how many are still unknown.
     - Bar chart of top countries by number of users.
     - Table: country, users, paid orders, revenue (Rupiah) from approved payments, generation requests.
   - Refresh button, mobile card layout mirroring the other admin sections.

## Technical notes

- Migration: add `country_code text` and `country_name text` to `public.profiles` (nullable, no default). Existing RLS covers it; no new table, so no new grants required.
- Country capture: small helper (`src/utils/geo.ts`) calling `https://ipapi.co/json/`, invoked from `AuthContext` after a successful signup/sign-in when `profiles.country_code` is null, then a scoped `update` on the user's own profile row (permitted by the existing self-update policy).
- New component `src/components/admin/AdminCountriesSection.tsx`, wired as a `TabsTrigger`/`TabsContent` pair in `src/pages/Admin.tsx`.
- Data: join profiles with `payment_orders` (status paid/approved) and `generation_requests` client-side, as the existing admin sections do; charts via recharts with existing theme tokens.
