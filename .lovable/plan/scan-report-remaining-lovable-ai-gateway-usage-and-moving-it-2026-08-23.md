# Scan report: remaining Lovable AI Gateway usage, and moving it to Alibaba Wan

## What the scan found

Only four files still reference a Lovable gateway:

1. `supabase/functions/veo-studio/index.ts` — Veo Studio (`/lab/veo-studio`). Creates and polls video jobs on `ai.gateway.lovable.dev/v1/videos` with `google/veo-3.1-lite | -fast | 3.1`.
2. `supabase/functions/broll-generate/index.ts` — Video Editor b-roll cutaways. Same video endpoint and Veo models.
3. `supabase/functions/generate-creative-asset/index.ts` — reads `LOVABLE_API_KEY` but no longer calls the gateway; images already run on Qwen and videos already dispatch to Wan. Only a leftover variable.
4. `supabase/functions/qris-reconcile/index.ts` — uses `connector-gateway.lovable.dev` for Gmail (payment receipt reconciliation). This is the connector gateway, not AI, and is not replaceable by Alibaba.

Everything else already runs on Alibaba DashScope: all chat/text via `_shared/qwen.ts`, images via `qwen-image` / `qwen-image-3.0-pro`, videos via `wan-video` (`wan2.7-t2v` / `i2v` / `r2v` / animate-mix).

Separately, `supabase/functions/gemini-image-generate/index.ts` still calls Google directly with `GEMINI_API_KEY` (not the Lovable gateway) and is referenced by `src/services/GeminiImageService.ts`. It appears unused by the live flows.

## What I will change

Replace Veo with Alibaba Wan in the two video functions, so no AI generation depends on Lovable credits.

1. `broll-generate`
   - Swap the Veo create/poll calls for DashScope async video synthesis (`wan2.7-t2v`) using the existing `_shared/dashscope.ts` helpers.
   - Map the quality selector to Wan resolution (lite -> 480p, fast -> 720p, high -> 1080p) and keep the orientation-to-size mapping.
   - Poll via the DashScope task endpoint, returning the same response shape so `BrollStudio.tsx` needs no change beyond field names if they differ.

2. `veo-studio`
   - Rename the pipeline internally to Wan while keeping the route and UI at `/lab/veo-studio`.
   - Text-to-video -> `wan2.7-t2v`; first-frame reference -> `wan2.7-i2v`; continuous sequence (previous clip's last frame as next first frame) keeps working through i2v.
   - Duration options change from 4/6/8s to Wan's supported set; resolution options become 480p/720p/1080p (4k is not available on Wan).
   - Update `src/pages/VeoStudio.tsx` labels and option lists to match, and rename the studio to reflect the Wan model.

3. `generate-creative-asset`: remove the unused `LOVABLE_API_KEY` read.

4. Verification: deploy both functions, run one real b-roll clip and one Veo Studio clip end to end, and confirm a playable MP4 plus correct history rows before reporting done.

## Trade-offs to be aware of

- Wan does not generate a soundtrack; Veo clips could include audio. Generated clips will be silent.
- No 4k output on Wan, and first+last-frame interpolation depends on the keyframe model availability on your account; if DashScope rejects it, that control is hidden rather than left broken.
- `qris-reconcile` stays on the Lovable connector gateway (Gmail access, no Alibaba equivalent).
