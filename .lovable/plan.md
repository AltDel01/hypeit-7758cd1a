# Remove unused Virality and Brand Identity pages, park Analytics

## Will it be faster?
Yes, a little. Right now every visitor downloads these pages' code on their very first visit, even if they never open them. That includes the strategy PDF export, which is fairly large. Removing them makes the first load lighter. The bigger speed gain is to load each page only when someone opens it, so the plan does that too.

## What changes
- **Virality** and **Brand Identity** pages are deleted, along with their links in the footer and the dashboard quick actions. Old links go to the normal "page not found" screen.
- **Analytics** is kept but hidden. Its links come out of menus, and the page code only downloads if someone visits it directly. You can bring it back later.
- All other pages (Dashboard, Creative Workflow, Trends, Pricing, Editor, and so on) work exactly as before. The Brand Profile inside Creative Workflow is separate and is not touched.
- Every page loads its own code on demand, so the homepage and dashboard open faster.

## Technical details
- `src/App.tsx`: remove `/virality` and `/brand-identity` routes. Convert page imports to `React.lazy` with a `Suspense` fallback, and keep `/analytics` as a lazy route.
- Delete `src/pages/Virality.tsx`, `src/pages/virality/`, `src/pages/BrandIdentity.tsx`, `src/components/virality/`, `src/hooks/useViralityStrategyForm.ts`, `src/hooks/useBrandIdentityForm.ts` (if it's only used by Brand Identity), `src/utils/virality/`, `src/services/virality/`, `src/types/virality.ts`. Before deleting, use `rg` to check nothing else imports them.
- Remove links in `Footer.tsx` and `QuickActions.tsx`, plus the reference in `services/requests/index.ts`. Remove `/virality` and `/brand-identity` from `public/sitemap.xml`.
- Leave the `generate-strategy` edge function deployed. Creative Workflow may still use it, so check that before considering removal.
- Check the build log and open the homepage and dashboard to confirm they load.
