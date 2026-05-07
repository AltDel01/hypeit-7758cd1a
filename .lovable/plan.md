## Goal
Ship a working video-generation hero on the homepage now (Wan T2V / I2V / R2V via Alibaba DashScope), and park the new Pokemon hero on a private route `/hero-preview` so you can keep iterating on it later.

The good news: the backend wiring already exists. `supabase/functions/wan-video/index.ts`, `wan-video-poll`, and `qwen-image` are deployed, and `SimplifiedDashboard` already reads `?mode=video-t2v|video-i2v|video-r2v|video-face-swap` from the URL plus localStorage to dispatch to the right Wan model. So this is mostly a frontend swap + a small upgrade to the old prompt-box hero so it can choose a mode and pass the right reference media.

## Plan

### 1. Restore the functional hero on `/`
- In `src/pages/Index.tsx`, replace `<PokemonChooserHero />` with `<HeroWithEditor />`.
- No other homepage sections change.

### 2. Park the Pokemon hero on `/hero-preview` (retrievable)
- Create `src/pages/HeroPreview.tsx` that simply renders `<Navbar />`, `<PokemonChooserHero />`, `<Footer />`. Nothing else.
- Add route `<Route path="/hero-preview" element={<HeroPreview />} />` in `src/App.tsx`.
- Not linked from anywhere — only reachable by typing the URL, so it stays out of the way.

### 3. Adjust the old hero for Wan video generation
The current `HeroWithEditor` already saves prompt + uploaded files to `localStorage` and navigates to `/dashboard`. Two focused changes:

**a. Add a video mode selector (3 small chips) above the prompt box**
- Text to Video → `video-t2v`
- Image to Video → `video-i2v` (requires 1 starting image)
- Reference to Video → `video-r2v` (accepts up to 3 reference images)
- Default selection: Text to Video.
- Selecting a mode also configures the upload button: hidden for T2V, single image for I2V, up to 3 images for R2V.

**b. Pass the chosen mode through to the dashboard**
- Append `?mode=video-t2v|video-i2v|video-r2v` when calling `navigate('/dashboard')`.
- Keep `saveEditorState({ ..., autoSubmit: true })` so the dashboard auto-submits on arrival (existing behavior).
- For I2V/R2V, the uploaded image(s) flow through the existing `uploadedFiles` array → `SimplifiedDashboard` already forwards them as `referenceImageUrl` / reference list to `wan-video`.

**c. Trim irrelevant controls for the homepage**
The old hero has a lot of editing-feature chips (AI Edit, iPhone Quality, Trim, Caption, B-roll, Subtitles, etc.) that are not part of Wan video generation. To keep this focused and avoid confusion:
- Hide the editing-features row on the homepage hero (keep the code, just don't render it).
- Keep the prompt textarea, the new mode chips, the upload button, and the Aspect / Resolution / Duration dropdowns (Wan accepts `size` and `duration`).
- Keep the "Generate" button.

Editing features remain available in the dashboard for users who want them, and the Pokemon hero on `/hero-preview` is untouched.

### 4. Sanity-check the dispatch path (no code changes expected)
Confirm in `SimplifiedDashboard` that:
- `?mode=video-t2v` → calls `wan-video` with `category: 'video-t2v'`, model `wan2.7-t2v`.
- `?mode=video-i2v` → passes `firstFrameUrl` from the first uploaded image.
- `?mode=video-r2v` → passes up to 3 `referenceImageUrls`.
This wiring already exists per `src/config/generationCategories.ts` and `supabase/functions/wan-video/index.ts`; no changes planned unless we discover a gap during implementation.

## Out of scope for this pass
- Image generation / image editing flows (Qwen) — already work, no changes.
- Face swap mode — leave for later.
- Pokemon hero polish — preserved verbatim on `/hero-preview` for future work.
- New billing/credit logic — existing credit calc applies.

## Files touched
- `src/pages/Index.tsx` — swap hero component.
- `src/pages/HeroPreview.tsx` — new page (Pokemon hero preview).
- `src/App.tsx` — add `/hero-preview` route.
- `src/components/home/HeroWithEditor.tsx` — add mode chips, gate uploads by mode, pass `?mode=` on navigate, hide editing-feature chips on homepage.

## Result
- `/` → functional prompt-box hero that can submit T2V, I2V, and R2V to Wan via DashScope and land on the dashboard with auto-submit.
- `/hero-preview` → the current Pokemon-style hero, preserved for you to refine later.