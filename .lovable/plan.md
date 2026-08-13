# Upgrade image generation to Qwen-Image-3.0-Pro

Move every image-producing feature onto Alibaba DashScope's `qwen-image-3.0-pro`, with an automatic fallback to the current Qwen image model if the new model errors or is unavailable.

## What changes for users

- Homepage hero chat image generation uses the new model.
- Dashboard image generation uses the new model.
- Instruction editing and mask inpaint use the new model where DashScope supports it.
- Creative Workflow day images stop using the Gemini image model and generate through the same Qwen pipeline as the rest of the app, so results and history look consistent.
- If the new model fails, the request quietly retries on the current model instead of showing an error. History records which model actually produced the asset.

## Technical changes

1. `src/config/generationCategories.ts`
   - `image-gen`: `modelDefault` and `modelPro` to `qwen-image-3.0-pro`.
   - `image-edit-instruction`: to the 3.0 edit variant, falling back to `qwen-image-edit`.
   - `image-inpaint`: to the 3.0 variant where the inpaint endpoint accepts it, otherwise unchanged.
   - Credit costs unchanged.

2. `supabase/functions/qwen-image/index.ts`
   - Add a fallback chain: attempt the requested model; on a 4xx model-unsupported / unavailable upstream error, retry once with the legacy equivalent (`qwen-image` / `qwen-image-plus` / `qwen-image-edit`).
   - Record the model that actually succeeded in `auto_model`, and log the fallback.
   - Keep the existing multimodal-generation endpoint, size snapping, `n`, storage upload, and credit flow untouched.

3. `supabase/functions/dashscope-inpaint/index.ts`
   - Same single-retry fallback around task creation, persisting the effective model in `auto_model`.

4. `supabase/functions/generate-creative-asset/index.ts`
   - Replace the Lovable AI Gateway Gemini image call with a Qwen image call (`qwen-image-3.0-pro`, same fallback), keeping the existing storage upload path, `creative_days` status updates, credit deduction, and `generation_requests` logging.

5. Verification
   - Deploy the three functions, run a real generation for text-to-image, instruction edit, inpaint, and a Creative Workflow day image, and confirm the stored `auto_model` plus a rendered result before closing out.

Note: if DashScope rejects `qwen-image-3.0-pro` on any of these endpoints, that surface keeps the current model via the fallback and I'll report exactly which one is unsupported rather than leaving it broken.
