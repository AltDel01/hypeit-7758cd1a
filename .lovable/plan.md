## Goal

When "Image" is selected in the homepage composer, show a DashScope-style options panel with: **Aspect ratio**, **Resolution (quality)**, **Number of images**, and **Prompt enhancement**. A single generation request can return multiple images, all stored and viewable.

## What exists today

- `ChatComposer` has a rich options panel only for `video`; `image` mode only supports an optional inpaint mask.
- Image generation flows: `ChatComposer.send()` → `useMultimodalChat` → `createGenerationRequest` → `qwen-image` edge function (DashScope), which hardcodes `n: 1` and stores a single `result_url`.
- `generation_requests` stores one `result_url`. There is an unused `result_layers` jsonb, but we'll add a dedicated array column for clarity.

## Plan

### 1. Database (migration)
Add a column to hold multiple image URLs:
- `result_images jsonb` (nullable, default null) on `generation_requests` — array of `storage:bucket/path` strings.
- `result_url` stays as the first image for backward compatibility (history thumbnails, feedback box, etc.).

No new RLS needed (existing row policies cover the table).

### 2. `qwen-image` edge function
- Accept new body fields: `n` (1-4, clamped), `promptExtend` (boolean), and continue accepting `size`.
- Set `parameters.n = n` and `parameters.prompt_extend = promptExtend`.
- Collect **all** returned image URLs from the response, download + upload each to the `generated-images` bucket (`{userId}/{requestId}-{i}.png`).
- Update the row with `result_images` = full array and `result_url` = first image.
- Keep the existing failure path (auto_failed → manual queue).

### 3. Service layer (`generationRequestService.ts`)
- Extend `CreateGenerationRequestParams` and the dispatcher with `size` (explicit), `imageCount`, `promptExtend`.
- Build `size` from a new helper that combines aspect ratio + resolution tier (1K / 2K).
- Pass `n` and `promptExtend` to the `qwen-image` invoke.
- Multiply credit cost by the number of images (n × base cost) for image-gen.

### 4. `useMultimodalChat.ts`
- Expand `imageOpts` to `{ maskFile?, ratio?, resolution?, count?, promptExtend? }`.
- Forward these to `createGenerationRequest`.
- On completion, read `result_images` and expose them on the chat message (e.g. `resultUrls: string[]`) in addition to `resultUrl`.

### 5. `ChatComposer.tsx`
- Add image option state: `imgRatio` (default 1:1), `imgResolution` (default 1K), `imgCount` (default 1), `imgPromptExtend` (default on).
- Add an image options panel mirroring the video panel styling (brand `#8C52FF`, semantic tokens), shown when `mode === 'image'` via the existing Settings2 toggle button (reuse the gear, show it for image too).
  - Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4 (visual chips like video).
  - Resolution: 1K, 2K chips.
  - Number of images: 1, 2, 3, 4 chips.
  - Prompt enhancement: a toggle chip.
- Pass the values through `send(..., imageOpts)`.

### 6. Result display (multi-image)
- `RequestDetailView`: when `result_images` has more than one entry, render a responsive grid of images, each with its own download/open; fall back to the single-image view otherwise.
- Chat `MessageBubble` (image kind): render a small grid when multiple `resultUrls` exist, else the single image.

## Technical details

Resolution/size mapping (DashScope `size` = `W*H`):

```text
ratio   1K            2K
1:1     1024*1024     1664*1664
16:9    1280*720      1920*1080
9:16    720*1280      1080*1920
4:3     1024*768      1664*1248
3:4     768*1024      1248*1664
```
Values are clamped to DashScope's supported pixel range; if a 2K size is rejected the edge function logs and the manual queue takes over (existing behavior).

Credit cost: `image-gen` base (50) × `imageCount`, checked against remaining balance before insert (existing check in `createGenerationRequest`).

Files touched:
- `supabase/functions/qwen-image/index.ts`
- `src/services/generationRequestService.ts`
- `src/hooks/useMultimodalChat.ts`
- `src/components/home/ChatComposer.tsx`
- `src/components/dashboard/RequestDetailView.tsx`
- one DB migration (add `result_images`)

## Verification
- Build passes.
- Select Image, open options, set 2 images + 2K + 16:9 + prompt enhancement on, send.
- Confirm request is created, edge function returns multiple images, both render in the chat and in dashboard history detail, and credits deduct by count.
