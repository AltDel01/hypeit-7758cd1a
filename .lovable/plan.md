## Trend Research (inspired by Agent-Reach)

Agent-Reach itself is a local Python CLI for desktop agents and can't run inside Viralin. But its core idea, cross-platform research for a topic, maps cleanly onto tools this project can use. We'll rebuild that idea natively: one **Firecrawl connector** does the heavy lifting (web search + scraping, including public YouTube / TikTok / Instagram / X result pages via `site:` queries), and the **Lovable AI gateway** synthesizes everything into an industry trend report and content ideas.

### How coverage works (honest scope)
- **General web, YouTube, TikTok, X, Instagram**: reached through Firecrawl `search` with per-platform `site:` filters (e.g. `site:youtube.com`, `site:tiktok.com`, `site:instagram.com`, `site:x.com`) plus a broad industry web search. This returns public titles, descriptions, and links without any per-user login.
- Login-gated deep data (private metrics, full Instagram feeds) is out of scope, matching the limits of a hosted app. Results are public-signal based, which is enough for trend and content ideation.
- Optional later upgrade: add the dedicated **TikTok** and **X** connectors for richer first-party public data. Not required for v1.

### Setup
- Connect the **Firecrawl** connector (required). If it hits insufficient credits (402), the UI shows a clear message.
- `LOVABLE_API_KEY` already present for AI synthesis.

### Backend: new edge function `trend-research`
1. Input: `{ industry: string, platforms: string[] }` (validated with Zod; JWT-validated).
2. For each selected platform, run a Firecrawl `search` (limit ~8) with a query like `"{industry} trending 2026" site:{platform-domain}`, plus one broad web search.
3. Collect titles, snippets, and URLs into a compact context (dedup, cap length).
4. Send that context to the AI gateway (`google/gemini-3-flash-preview`, `response_format: json_object`) with a prompt that returns:
   - `trendReport`: per-platform trending topics, formats, and recurring hooks.
   - `contentIdeas`: a ranked list of concrete ideas `{ title, angle, platform, hookExample, whyItWorks }`.
5. Return generic errors to the client; log details internally (per project security rules).
6. Handle 429 / 402 from both Firecrawl and the AI gateway with clear status codes.

### Database
- New table `trend_research` to store past runs: `id`, `user_id`, `industry`, `platforms` (jsonb), `report` (jsonb), `ideas` (jsonb), `created_at`. RLS: users read/insert/delete their own rows, plus `service_role`. Includes the required GRANTs.

### Frontend: new route `/trends`
- `src/pages/TrendResearch.tsx`, registered in `App.tsx`, with a "Trends" link in the Dashboard sidebar (reusing the existing icon set, e.g. `TrendingUp`).
- UI: industry input + platform multi-select chips (YouTube, TikTok, X, Instagram, Web), a "Research" button, loading state, then two panels:
  - **Trend report** grouped by platform.
  - **Content ideas feed**, each idea a card with a "Use in workflow" action that hands the concept/hook to the Creative Workflow (via the existing localStorage handoff pattern).
- Past runs listed from `trend_research` so users can revisit research.
- Styling follows brand rules (primary `#8C52FF`, no em dashes, `display_name` where relevant).

### Technical notes
- Firecrawl called only server-side (`FIRECRAWL_API_KEY` via `Deno.env`), never client-side.
- Feature is additive: no changes to existing generation or workflow logic beyond the optional handoff into Creative Workflow.

### Out of scope for v1
- Private/logged-in platform data, follower-level analytics, and real-time trend scores. These would need per-user OAuth or paid platform APIs and can be a follow-up.
