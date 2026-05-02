## Goal

Replace the homepage hero with a Pokémon-hologram chooser (Image / Video, each splitting into Generation / Editing on hover). Wire image and video generation flows to Alibaba Cloud Model Studio (DashScope), correctly differentiating Qwen-Image-Layered (decompose) from Qwen-Image-2.0-Pro (instruction edit), categorize face swap under Video Generation, and keep Video Editing fully manual (existing editor workflow, unchanged).

## Important constraint discovered: Qwen-Image-Layered

`Qwen-Image-Layered` is NOT exposed as a hosted DashScope API. It is an open-weights model published only on HuggingFace and ModelScope (`Qwen/Qwen-Image-Layered`), invoked locally via the `diffusers` `QwenImageLayeredPipeline` (requires CUDA GPU + ~24GB VRAM). DashScope's Singapore/Beijing endpoints do not list it.

We have two options for "Decompose Editing" — **I am proposing Option A as the default** but flagging this for your decision below.

- **Option A (recommended, ships now):** Use the **HuggingFace Inference Providers / Spaces API** for `Qwen/Qwen-Image-Layered`. The HF Space demo exists; we call it via the gradio_client compatible HTTP endpoint. Pros: free during launch, no GPU infra. Cons: rate-limited, can be slow or queued.
- **Option B (premium path, later):** Self-host Qwen-Image-Layered on a Replicate / Modal / RunPod GPU endpoint. We add a `HF_TOKEN` or provider key as a secret. We can scaffold the integration now and flip it on once you provision the GPU endpoint.
- **Option C (defer):** Ship Decompose Editing as "coming soon" UI and only enable Image Generation + Image Editing (instruction-based) at launch.

For all three options the frontend behavior is identical — the difference is which edge function the request fans out to.

## Corrected model + endpoint mapping

| Hero card | Sub-card | Model(s) | DashScope endpoint | Notes |
|---|---|---|---|---|
| Image | Generation | `qwen-image-2.0` (default) / `qwen-image-2.0-pro` (Pro tier) | `POST /api/v1/services/aigc/multimodal-generation/generation` (sync) | Text-to-image |
| Image | Editing > **Instruction Editing** tab | `qwen-image-2.0-pro` | same as above, with reference images in `messages.content` | Edit by prompt + ref image |
| Image | Editing > **Decompose Editing** tab | `Qwen/Qwen-Image-Layered` (HF/self-host) | HF Space / custom GPU endpoint | Returns N RGBA layers |
| Video | Generation > **Text-to-Video** | `wan2.7-t2v` (default) / `wan2.6-t2v` | `POST /api/v1/services/aigc/video-generation/video-synthesis` (async + poll) | |
| Video | Generation > **Image-to-Video** | `wan2.7-i2v` | same async endpoint | |
| Video | Generation > **Reference-to-Video** | `wan2.7-r2v` | same async endpoint | |
| Video | Generation > **Face Swap** *(moved here)* | `wan2.2-animate-mix` | `POST /api/v1/services/aigc/image2video/video-synthesis` (async + poll) | |
| Video | Editing | (none — manual) | n/a | Existing editor upload workflow, **unchanged** |

All DashScope calls use `Authorization: Bearer ${QWEN_API_KEY}` against `https://dashscope-intl.aliyuncs.com` (Singapore region).

## Hero redesign

`src/components/home/PokemonChooserHero.tsx` replaces `<HeroWithEditor />` in `src/pages/Index.tsx` (existing component preserved on disk).

```text
            CREATE WHAT GOES VIRAL
   ┌──────────────┐      ┌──────────────┐
   │   IMAGE      │      │   VIDEO      │
   │  (hologram)  │      │  (hologram)  │
   └──────────────┘      └──────────────┘
        on hover ↓             on hover ↓
   ┌──────┬──────┐        ┌──────┬──────┐
   │ Gen  │ Edit │        │ Gen  │ Edit │
   └──────┴──────┘        └──────┴──────┘
```

Each child card routes to the dashboard with a `?mode=` param.

Hologram styling (no new deps): rotating `conic-gradient` border, cursor-tracked `radial-gradient` foil, subtle SVG-noise prismatic layer, sheen sweep on hover, capped 3D tilt (±10°). CSS lives in existing `src/styles/animations/keyframes.css` + `utility-classes.css`. Mobile: tap to expand children inline.

## Dashboard mode handling

`SimplifiedDashboard.tsx` reads `?mode=` and pre-configures the workspace:

| `?mode=` value | UI behavior |
|---|---|
| `image-gen` | Prompt only; no media required |
| `image-edit` | Two tabs: **Instruction Editing** (default) and **Decompose Editing**. Both require ≥1 reference image |
| `video-t2v` | Prompt only |
| `video-i2v` | Requires 1 first-frame image |
| `video-r2v` | Requires reference image(s) |
| `video-face-swap` | Requires 1 source video + 1 face image |
| `video-edit` | Existing manual flow, no change |

The two tabs inside Image Editing render via `<Tabs>` (already in `ui/tabs.tsx`). Decompose Editing UI: upload image, click "Decompose", show returned RGBA layers as toggleable thumbnails with reorder/hide/recolor controls (post-process locally with canvas; no extra API calls).

## Backend: edge functions

All keyed by `QWEN_API_KEY` (already in secrets). Each function: validates JWT in code, calls upstream API, on success uploads result to Supabase Storage and updates `generation_requests`; on failure flags `auto_failed=true`, leaves `status='new'` so the manual editor queue picks it up. Errors returned to the client are generic; detailed errors logged server-side.

Create:
- `supabase/functions/_shared/dashscope.ts` — base URL, auth header, error mapping.
- `supabase/functions/qwen-image/index.ts` — Image Generation + Instruction Editing (sync). Body: `{ requestId, mode: 'gen'|'edit', prompt, size?, referenceImageUrls?[], modelTier? }`.
- `supabase/functions/qwen-layered/index.ts` — Decompose Editing. Implementation per chosen option (A: HF Space; B: self-hosted GPU URL; C: returns 501 not_implemented). Body: `{ requestId, imageUrl }`. Returns array of layer URLs uploaded to Storage.
- `supabase/functions/wan-video/index.ts` — Submits async video task; switches model id from `mode`: `wan2.7-t2v | wan2.7-i2v | wan2.7-r2v | wan2.2-animate-mix`. Returns `task_id`.
- `supabase/functions/wan-video-poll/index.ts` — Given `requestId` + `task_id`, polls `GET /api/v1/tasks/{task_id}` until `SUCCEEDED|FAILED`. Client polls every ~10s.

Video Editing has **no edge function** — it stays in the existing manual editor pipeline.

## Frontend service changes

Edit `src/services/generationRequestService.ts`:
- Accept `category` ∈ `image-gen | image-edit-instruction | image-edit-decompose | video-t2v | video-i2v | video-r2v | video-face-swap | video-edit-manual` and `modelTier`.
- Pre-flight credit check (existing) using new per-model costs.
- After insert: dispatch to the right edge function (or skip dispatch entirely for `video-edit-manual`).
- For video categories: store returned `task_id` in `provider_task_id`, then poll.
- On any auto-fulfill error: `auto_failed=true`, toast "Auto-generation failed, our editors will take over." Editor queue automatically picks it up.

`SimplifiedDashboard.tsx`: read `?mode=`, render the right input controls and the Image-Editing tabs.

## Database migration

Add to `generation_requests`:
- `category text` — values listed above. Backfill: `request_type='image'` → `image-gen`, `request_type='video'` → `video-edit-manual` (safest, preserves manual fulfillment for existing rows).
- `auto_provider text` nullable — `qwen | wan | hf-layered | null`.
- `auto_model text` nullable — exact model id used.
- `auto_failed boolean default false`.
- `provider_task_id text` nullable — DashScope async task id.
- `result_layers jsonb` nullable — for decompose, array of `{url, order, visible, hex_tint}`.

No RLS policy changes required; existing policies cover the new columns.

## Credit costs (`src/config/creditCosts.ts`)

- Image gen `qwen-image-2.0` = 50, `qwen-image-2.0-pro` = 80.
- Image edit instruction (Pro) = 80.
- Image edit decompose (HF) = 60 launch / TBD post-launch.
- Wan T2V/I2V/R2V (10s 720p) = 250 each.
- Wan face swap (`wan2.2-animate-mix`) = 300.
- Video Editing (manual) = existing cost, unchanged.

## Editor override flow (unchanged)

- Auto-failed rows reappear with `status='new'` + `auto_failed=true` and are visually flagged in the editor queue ("Auto failed, take over").
- Editors can also override a successful auto result by uploading a replacement; that path already exists in `RequestDetails.tsx` and stays as is.

## Files

Create:
- `src/components/home/PokemonChooserHero.tsx`
- `src/components/home/HoloCard.tsx`
- `src/components/dashboard/image-edit/InstructionEditTab.tsx`
- `src/components/dashboard/image-edit/DecomposeEditTab.tsx`
- `src/config/generationCategories.ts`
- `supabase/functions/_shared/dashscope.ts`
- `supabase/functions/qwen-image/index.ts`
- `supabase/functions/qwen-layered/index.ts`
- `supabase/functions/wan-video/index.ts`
- `supabase/functions/wan-video-poll/index.ts`
- One DB migration

Edit:
- `src/pages/Index.tsx` (swap hero)
- `src/components/dashboard/SimplifiedDashboard.tsx` (read `?mode=`, render tabs/controls)
- `src/services/generationRequestService.ts` (category + dispatch + polling)
- `src/styles/animations/keyframes.css`, `utility-classes.css`
- `src/config/creditCosts.ts`

Preserve `HeroWithEditor.tsx` (not deleted).

## Implementation order

1. DB migration.
2. `_shared/dashscope.ts` + `qwen-image` (test sync gen + instruction edit end-to-end).
3. `wan-video` + `wan-video-poll` (test all 4 video subtypes including animate-mix).
4. `qwen-layered` (per chosen option).
5. `generationRequestService` dispatch + polling client logic.
6. `PokemonChooserHero` + `HoloCard` + holo CSS, swap into `Index.tsx`.
7. Dashboard `?mode=` routing + Image-Editing tabs.
8. End-to-end QA (one request per category; force a Qwen failure to confirm fallback to manual editor; manual editor override test; video-edit category routes straight to manual queue with no API call).

## Two questions to answer before I implement

1. **Decompose Editing path** — Option A (HuggingFace Space, free, slow), B (self-host GPU, you provision later, premium quality), or C (ship as "coming soon" UI for now)?
2. **Default image-gen model tier** — `qwen-image-2.0` for Free/Starter and `qwen-image-2.0-pro` for Pro/Specialist (cost-controlled), or always Pro for everyone?
