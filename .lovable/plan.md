## Goal

- The homepage prompt box (T2V / I2V / R2V tabs, prompt, suggestion chips, timeline, Ratio/Quality/Frame/Duration, Generate) becomes the single canonical prompt UI.
- The dashboard no longer shows a prompt box. It becomes a history / projects view.
- Generate runs directly from the homepage (calls the existing `qwen-image` / `wan-video` edge functions and polls via `wan-video-poll`). No more redirect-then-resubmit on the dashboard.

## Changes

### 1. Homepage prompt box (`src/components/home/HeroWithEditor.tsx`)

- Keep the existing simplified UI (T2V / I2V / R2V tabs, prompt, chips, timeline, Ratio/Quality/Frame/Duration, Generate). No editing tools, no special modes, no Media/Voice, no credits badge, no foundation-model banner.
- Wire Generate to submit directly:
  - If user is not signed in: redirect to `/signup` and resume after auth (reuse the existing `authRedirectPath` + localStorage state-persistence pattern).
  - If signed in: pre-flight credit check, insert a row in `generation_requests`, then invoke `wan-video` with the selected model:
    - T2V → `wan2.7-t2v` (category `video-t2v`)
    - I2V → `wan2.7-i2v` (category `video-i2v`, requires uploaded first frame)
    - R2V → `wan2.7-r2v` (category `video-r2v`, requires reference image[s])
  - After submission, start the same client-side polling loop currently used in `SimplifiedDashboard` (calls `wan-video-poll` every ~5s until `completed` / `failed`).
  - Disable the Generate button while a request is in-flight (status not `completed` / `failed`) to prevent the duplicate-request bug we already fixed in the dashboard.
- Show inline progress + result (video player) directly on the homepage below the prompt box. On completion, also surface a "View in history" link to `/dashboard`.
- Keep the homepage marketing sections (CoreFeatures, PlatformBenefits, etc.) below.

### 2. Dashboard becomes history-only (`src/pages/Dashboard.tsx`, `src/components/dashboard/SimplifiedDashboard.tsx`)

- Remove the entire prompt composer block from `SimplifiedDashboard`: textarea, tool row (AI Edit / iPhone Quality / Trim / Caption / B-roll / Transitions / Effects / Zoom / Thumbnail Generator / Censor Word / Language Dubbing), special modes (AI Clip / Retention Editing / AI Creator), Media + Voice uploaders, suggestion chips, timeline, Ratio/Quality/Frame/Duration, credits badge, Generate button, ModeBanner, foundation-model badge.
- Remove the homepage→dashboard auto-submit handoff (the localStorage `pendingGeneration` resume code path) since generation now happens on the homepage.
- Keep and make primary on the dashboard:
  - Generation history list (`GenerationHistory`)
  - Recent activity / request detail view (`RequestDetailView`, `ReviewFeedbackBox`)
  - Projects showcase (`ProjectsShowcase`)
  - Usage metrics (`UsageMetrics`)
  - Sidebar (`DashboardSidebar`) and header
- Add a prominent "Create new" CTA in the dashboard header that links back to `/` (homepage prompt box) so users can start a new generation from history view.
- Delete now-unused dashboard-only pieces: `ModeBanner.tsx`, `QuickActions.tsx` if it only points to the removed composer, `CreditCostPreview.tsx` if it was tied to the composer (verify before removing; otherwise keep).

### 3. Shared logic extraction

To avoid duplicating the submission + polling logic, extract it from `SimplifiedDashboard.tsx` into a hook:

- New file: `src/hooks/useVideoGeneration.ts`
  - Inputs: `{ mode: 't2v' | 'i2v' | 'r2v', prompt, firstFrame?, refImages?, ratio, quality, frame, duration }`
  - Returns: `{ submit, isSubmitting, currentRequest, progressStatus, resultUrl, error, reset }`
  - Encapsulates: credit pre-check → insert `generation_requests` row → invoke `wan-video` → 5s polling of `wan-video-poll` → final state.
- Use this hook in the new homepage prompt box. The dashboard does not need it anymore.

### 4. State persistence cleanup

- Remove the homepage→dashboard `pendingGeneration` localStorage handshake described in `mem://workflow/state-persistence-homepage-to-dashboard`.
- Replace with: auth-redirect persistence only (so an unauthenticated user clicking Generate resumes their prompt + selected mode after signup, still on the homepage).
- Update memory `state-persistence-homepage-to-dashboard` to reflect the new flow (homepage-only).

### 5. Memory updates

- Update `mem://dashboard/prompt-interface` → describe dashboard as history-only; prompt interface lives on homepage.
- Update `mem://workflow/state-persistence-homepage-to-dashboard` → rename/repoint to homepage-local persistence.
- Add a new core rule: "Generation prompt UI lives only on the homepage (`/`). The dashboard (`/dashboard`) is history + projects + usage only."

## Out of scope

- No changes to edge functions (`wan-video`, `wan-video-poll`, `qwen-image`).
- No changes to the editing-tools feature surface elsewhere (Features page, etc.).
- No changes to admin/editor flows.

## Acceptance

- Homepage shows exactly the box in image-190 and Generate works end-to-end (submit → polling → inline video result).
- `/dashboard` shows no prompt composer at all, just history / projects / usage with a "Create new" link to `/`.
- No duplicate request when clicking Generate twice (button disabled while in-flight).
- Unauthenticated Generate click → signup → returns to homepage with prompt + mode restored, ready to submit.
