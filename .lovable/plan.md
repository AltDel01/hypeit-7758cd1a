# Roll out Wan 3.0 long clips (up to 30s) across remaining features

The homepage composer already offers 20s and 30s and routes to `wan3.0-video`. Three places still cap clips at 15s or hardcode 5s. This plan brings them in line using the shared helpers already in `_shared/dashscope.ts` (`clampWanDuration`, `needsLongFormModel`, `WAN_LONGFORM_MODEL`, `createWanVideoTask`).

## 1. Wan Studio (unlisted `/lab/veo-studio`)

- Backend (`veo-studio`): replace the hardcoded 2-15s clamp with `clampWanDuration`, and pick the model with `needsLongFormModel` (long clips use `wan3.0-video`, otherwise the current `wan2.7-t2v` / `wan2.7-i2v`). Submit through `createWanVideoTask` so a rejected long-form job falls back to the legacy model at 15s instead of failing.
- UI (`VeoStudio.tsx`): extend the per-scene duration buttons from `4, 6, 8, 10, 15` to include `20` and `30`, with a short note that clips over 15s use the Wan 3.0 long-form model.

## 2. Editor B-roll (`broll-generate`)

- Same change: clamp with `clampWanDuration`, switch to `wan3.0-video` above 15s, submit via `createWanVideoTask` with the legacy fallback.
- B-roll cutaways are normally short, so the default stays 5s; only explicitly requested longer clips use long-form.

## 3. Creative Workflow video assets

- `generate-creative-asset` currently dispatches every workflow video with `duration: 5`. Accept an optional duration from the caller, clamp it, and pass it to `wan-video` (which already routes >15s to Wan 3.0).
- `CreativeWorkflow.tsx`: add a duration selector (5 / 10 / 15 / 20 / 30s) on day cards whose asset type is Video, defaulting to 5s, and send the chosen value when generating.

## Out of scope

The dashboard AI Content Generator's Video tab still calls the legacy `generate-video` function (Make.com webhook pipeline), not Wan. Adding a 30s option there would need that tab repointed at `wan-video` first, so it is not part of this change unless you want it included.

## Technical notes

- Wan long-form limit is 30s; `clampWanDuration` enforces 2-30 and the fallback path re-clamps to 15s for `wan2.7-*`.
- Credit cost is unchanged in this plan; longer clips will cost the same as today unless you want duration-based pricing.
