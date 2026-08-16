# Fix: latest video request stuck on "Processing"

## Correction: the limit was ours, not Alibaba's

The playground worked because Wan itself accepts that prompt. The rejection came from our own code: `wan-video` has a hardcoded `if (prompt.length > 4000) return 400` guard, and the prompt was 4,777 characters. The request died in our edge function and never reached DashScope at all.

Evidence from the stuck row (today 04:46 UTC, putra.ekadarma@gmail.com, reference-to-video with two reference images):
- `provider_task_id` empty, `result_url` empty, prompt length 4,777
- `failure_reason` was written 15 minutes later by our safety-net cron: "This request never reached the provider."

Second problem, independent of the first: when submission fails, nothing tells the user. The browser only logs the error to the console and keeps polling, and a row with status `new` renders as "Processing", so a request that died in the first second looks like it is still working, forever.

## The fix

### 1. Remove the artificial prompt cap
- Drop the 4,000-character rejection. Send the prompt through to DashScope and let Alibaba decide, exactly like the playground does.
- Keep only a sanity ceiling far above real usage, and if DashScope ever does reject on length, surface their actual message instead of blocking the request ourselves.
- Keep the existing cleanup that strips our trailing `| Aspect: ... | Duration: ...` metadata line before the prompt goes to the model.

### 2. Make submission failures visible
- Every error path in `wan-video` (bad media, provider rejection, network error) marks the row failed with a reason before returning, so no row is ever left silently untouched.
- The chat composer treats a failed row as terminal: it stops polling and shows the reason instead of a permanent spinner.
- Request history stops showing failed rows as "Processing".

### 3. Recover this request
- Resubmit the stuck request now that the cap is gone, so the user gets their video.

## Your Veo question

Yes, Veo is available to us through the Lovable AI Gateway (`google/veo-3.1-lite`, `veo-3.1-fast`, `veo-3.1`). It is already in use in this app for the b-roll clips in the Editor. Practical differences versus Wan for the main generator:

| | Wan (DashScope, current) | Veo (AI Gateway) |
| --- | --- | --- |
| Clip length | 2 to 15 seconds | 4, 6 or 8 seconds only |
| Image input | first frame, first+last frame, multiple reference images, face swap, lip sync | single starting image only |
| Prompt | long prompts fine | provider always rewrites the prompt |
| Billing | your DashScope account | workspace AI credits |
| Quality | good | generally stronger motion and it generates audio |

So Veo cannot replace Wan outright: the 15-second durations, last-frame control, multi-reference (which is exactly what this stuck request used), lip sync and face swap all only exist on Wan. What is realistic is Veo as an option alongside Wan, or as an automatic fallback when a Wan submission fails, for the plain text-to-video and single-image-to-video cases.

This plan fixes the Wan bug only. Tell me if you want the Veo option added and I will extend it.

## Technical notes

- `supabase/functions/wan-video/index.ts`: remove the `prompt.length > 4000` early return; route every remaining early return through `markFailed` so the row always carries a reason.
- `src/hooks/useMultimodalChat.ts`: treat `auto_failed = true` as terminal in the poll loop and render `failure_reason`.
- Request history status mapping: `auto_failed` rows no longer map to the unified "Processing" state.
- No schema changes; `failure_reason` already exists.
