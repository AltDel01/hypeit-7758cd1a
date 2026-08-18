# Three-language support: English, Bahasa Indonesia, Vietnamese

Make the whole app translatable, with automatic language detection on first visit and a switcher in the navbar plus the existing Language settings page.

## How it will work

- On first visit the app picks a language from the visitor's country/browser: Indonesia to Bahasa Indonesia, Vietnam to Vietnamese, everyone else English.
- The user can override it from a globe dropdown in the navbar, or from the Language page in Settings. The choice is remembered on the device and saved to their profile when signed in, so it follows them across devices.
- The `<html lang>` attribute updates with the language, which also helps SEO.

## Technical approach

- Add `i18next` + `react-i18next` with a small `src/i18n/` folder: one namespace file per area (`common`, `home`, `pricing`, `dashboard`, `tools`, `admin`, ...) for each of `en`, `id`, `vi`.
- Provider mounted in `App.tsx`; language state driven by a `useLanguage` hook that reads, in order: saved profile preference, localStorage, detected country (the existing country lookup already in `AuthContext`), browser locale, then English.
- New `LanguageSwitcher` component (globe + current flag) in `Navbar.tsx` desktop and mobile menus; `src/pages/Language.tsx` is reduced to the three supported options and wired to the same hook instead of writing a raw localStorage key.
- Persist to a `preferred_language` column on `public.profiles` (nullable text) so signed-in users keep their choice.
- Screens are converted file by file: hardcoded strings replaced with `t('key')` calls, English copy moved verbatim into the `en` files, then `id` and `vi` translations authored to match.

## Rollout order

1. Foundation: i18n setup, detection, switcher, profile column, Language page.
2. Public site: Navbar, Footer, Home, Pricing, Features, Enterprise, FAQ, Careers, Refund, Explainer, Login/Signup, NotFound.
3. App: Dashboard, Creative Workflow, Trends, Posts, Tools, Settings, Credit Usage, request/history views, toasts and error messages.
4. Internal: Admin and Editor workspaces.

## Notes

- Dynamic content (AI-generated scripts, strategies, trend reports, emails) stays in whatever language the model returns; translating those is a separate change if you want it.
- Because of the volume of copy, this ships in stages: after step 1 and 2 the public site is fully trilingual, and the remaining areas keep English until their step lands.
