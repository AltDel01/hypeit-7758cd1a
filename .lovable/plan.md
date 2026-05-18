
## Goal

Extend `/tools` with three new tabs and one shared upgrade, inspired by Open-Generative-AI, but keeping the current Alibaba DashScope backend. Lipsync (not in DashScope) goes through fal.ai. Cinema and Workflow reuse existing T2V/I2V endpoints with structured prompt augmentation. Multi-image input replaces the current 4-file limit on the existing Sequence Generation boxes too.

## New `/tools` tab layout

```text
[Sequence Gen] [Ad Copy] [Viral Predictor] [Lip Sync] [Cinema] [Workflow]
```

All three new tabs sit alongside the existing ones, no replacement.

---

## 1. Lip Sync Studio (new tab)

Two modes via toggle:
- **Portrait + Audio → Talking Video** (default)
- **Video + Audio → Lipsynced Video**

Inputs:
- image OR video uploader (mode-dependent)
- audio uploader (mp3/wav/m4a, required)
- optional prompt (motion guidance)
- resolution: 480p / 720p / 1080p
- model picker: 3 to 5 fal.ai models (Sync Lipsync, LatentSync, Veed Lipsync, Infinite Talk image, Infinite Talk V2V)

Backend: new edge function `fal-lipsync` that submits to fal.ai `queue` API and a poller `fal-lipsync-poll`. Result lands in the same `generation_requests` table with `category='video-lipsync'` so it shows up in dashboard history and credit tracking just like every other generation.

Requires one new secret: `FAL_API_KEY`. I will request it via the secrets tool right before deploying the function.

## 2. Cinema Studio (new tab)

Single-prompt UI on top of the existing T2V/I2V Wan endpoints (no new provider). Adds pro camera controls that get appended to the prompt with the existing bracketed-tag convention (`mem://infrastructure/prompt-parsing-logic`):

- Shot type: wide / medium / close-up / macro / extreme close-up
- Lens: 24mm / 35mm / 50mm / 85mm / 135mm
- Aperture: f/1.4 / f/2.8 / f/5.6 / f/8
- Camera move: static / dolly / pan / orbit / handheld
- Lighting: golden hour / neon / studio softbox / hard rim
- Film stock: digital / 16mm / 35mm / anamorphic

Final prompt sent to `wan-video`:
```text
[Cinema] user prompt | Shot: close-up | Lens: 85mm | Aperture: f/1.4 | Move: dolly-in | Light: golden hour | Stock: anamorphic | Aspect: 21:9 | Duration: 5s
```

No new edge function, no new secret. Just a new React component that composes the prompt and calls `createGenerationRequest({ category: 'video-t2v' | 'video-i2v' })`.

## 3. Workflow Studio (new tab)

Stripped-down chainer, not a full node-graph editor. Linear pipeline of 2 to 4 steps:

```text
Step 1: T2I  →  Step 2: I2V  →  Step 3: Lipsync (optional)
```

UI:
- Step list with `+ Add step` (max 4)
- Each step picks a stage type (T2I / I2I / T2V / I2V / Lipsync) and inherits the previous step's `result_url` as its input
- "Run workflow" submits step 1, then a frontend orchestrator waits for `status='completed'` on `generation_requests` before submitting step n+1 with the previous result as `firstFrameUrl` or `referenceImageUrl`
- Persist workflow definitions in a new table `tool_workflows` so users can save & rerun
- Save each run in `tool_workflow_runs` (one row per execution, references the underlying `generation_requests.id` per step)

New tables (RLS scoped to `user_id`):
- `tool_workflows(name, steps jsonb, user_id)`
- `tool_workflow_runs(workflow_id, step_request_ids uuid[], status, user_id)`

No node-graph library, no react-flow. Plain vertical list, drag-to-reorder via `@dnd-kit/sortable` (already in tree).

## 4. Multi-image input + upload history (shared upgrade)

Applies to Sequence Generation, Lip Sync, Cinema, Workflow.

- Bump per-box reference cap from 4 → 14
- New "Upload Library" drawer: lists every file the user has previously uploaded to the `product-images` bucket, scoped by `user_id` folder
- Click to attach to current box without re-uploading
- Storage path stays `${user_id}/${filename}`, listed via `supabase.storage.from('product-images').list(user_id)`

No schema changes for this part, only frontend.

---

## Files to create / edit

```text
src/pages/Tools.tsx                                  edit: add 3 tabs
src/components/tools/LipSyncStudio.tsx               new
src/components/tools/CinemaStudio.tsx                new
src/components/tools/WorkflowStudio.tsx              new
src/components/tools/shared/UploadLibrary.tsx        new
src/components/tools/shared/MultiImagePicker.tsx     new
src/components/tools/SequenceGeneration.tsx         edit: use MultiImagePicker, cap 14
src/services/falLipsyncService.ts                    new (frontend invoke wrapper)
src/services/workflowService.ts                      new
supabase/functions/fal-lipsync/index.ts              new
supabase/functions/fal-lipsync-poll/index.ts         new
supabase/config.toml                                 edit: register 2 new functions
```

Migration (one call):
- `tool_workflows`, `tool_workflow_runs` tables + RLS
- new enum value or string for `generation_requests.category`: `video-lipsync`

Secrets: `FAL_API_KEY` (requested via secrets tool before deploying lipsync functions).

## Out of scope (explicit)

- Muapi.ai integration (not chosen)
- 50+ model picker (not chosen)
- Local sd.cpp / Wan2GP (impossible in hosted web app)
- Full node-graph editor (replaced by linear chainer)

## Credit cost

Each step in Workflow Studio is a normal `generation_requests` row, so existing variable-credit logic (`mem://pricing/variable-credit-system`) and trigger-based deduction (`mem://infrastructure/credit-tracking-architecture`) apply automatically. Lipsync gets a flat baseline cost matched to T2V tier.
