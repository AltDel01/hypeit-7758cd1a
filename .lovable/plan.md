## Goal

Add a **mask-based erase / inpaint** mode to the Image feature so users can paint over regions (like the colored event boxes on the calendar screenshot) and have Alibaba DashScope cleanly remove and fill them, instead of relying only on text-instruction editing.

## User flow

1. User selects **Image** mode in the homepage prompt box and attaches an image via the paperclip.
2. A new **"Erase / Inpaint"** button appears next to the attachment thumbnail (only when exactly one image is attached).
3. Clicking it opens a mask-painting dialog (reuses the existing `MaskDrawingCanvas` component already in `src/components/stable-diffusion/`):
   - Brush + eraser + clear + brush-size controls
   - Live overlay on the uploaded image
4. User paints over the colored boxes, optionally types an instruction (e.g. "remove, keep grid background"), clicks **Apply**.
5. The mask PNG + source image + prompt are sent to a new edge function which calls DashScope's image-edit/inpaint endpoint.
6. Result is stored in `Generated Images` bucket and rendered in the chat thread like any other image result.

## Technical plan

**1. New category `image-inpaint`**
- Add to `src/config/generationCategories.ts`, model: `wanx-image-edit` (DashScope image-edit endpoint supports mask-based local edits). Fall back to `qwen-image-edit-2.0` if mask param unsupported.

**2. New edge function `dashscope-inpaint`** (`supabase/functions/dashscope-inpaint/index.ts`)
- Auth via JWT (matching existing `qwen-image` pattern).
- Inputs: `requestId`, `imageUrl`, `maskUrl`, `prompt`.
- Calls DashScope `image-edit` task with `function: "description_edit_with_mask"` (or `inpainting` task on `wanx-v1`), passing `base_image_url` + `mask_image_url`.
- Polls the async task, downloads result, uploads to `Generated Images`, updates `generation_requests`.
- Generic error responses, `auto_failed=true` fallback for editor queue (matches existing pattern).

**3. Frontend**
- New component `src/components/home/InpaintDialog.tsx` wrapping `MaskDrawingCanvas` in a `Dialog`. Exports `(imageFile, maskFile, prompt) => void` on apply.
- `ChatComposer.tsx`: when Image mode + exactly 1 attachment, show an "Erase area" button on the attachment thumbnail that opens the dialog.
- `useMultimodalChat.ts`: extend `send(...)` with optional `maskFile`. When present, upload it (prefix `mask-`) and force `category: 'image-inpaint'`.
- `generationRequestService.ts`: accept `maskUrl` field, route to `dashscope-inpaint` function when category is `image-inpaint`.

**4. Storage**
- Reuse existing `Product Images` bucket for the user-uploaded mask (private, same as other refs). No new bucket needed.

**5. Credits**
- Same cost as `image-edit-instruction` (no new pricing entry needed).

## Out of scope

- No new bucket, no schema migration (existing `generation_requests` columns cover it via the existing `reference_image_urls` array, with the mask as the second entry, or via a JSON metadata field already present).
- No changes to Auto / Chat / Video routing.

## Files to add / edit

- `supabase/functions/dashscope-inpaint/index.ts` (new)
- `src/components/home/InpaintDialog.tsx` (new)
- `src/components/home/ChatComposer.tsx` (edit)
- `src/hooks/useMultimodalChat.ts` (edit)
- `src/services/generationRequestService.ts` (edit)
- `src/config/generationCategories.ts` (edit)

## Expected result on the calendar screenshot

User paints over each colored event block → DashScope inpaints them with the surrounding gray grid cell background → output is a clean empty calendar grid.
