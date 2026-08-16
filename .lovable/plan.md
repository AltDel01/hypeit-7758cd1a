# Fix: latest video request stuck on "Processing"

## What actually happened

The latest request (today 04:46 UTC, putra.ekadarma@gmail.com, reference-to-video with two reference images) never reached Alibaba at all.

Confirmed from the database row:
- `provider_task_id` is empty, `result_url` is empty
- `auto_failed = true`, `failure_reason = "This request never reached the provider."` (written by the safety-net cron 15 minutes later)
- prompt length is **4,777 characters**

The submit function `wan-video` rejects any prompt longer than 4,000 characters with a 400 before it touches the database, so the row was never marked failed and no task was ever created. The browser only logs that error to the console and keeps polling, and a row with status `new` renders as "Processing" in the UI. Result: a request that died in the first second looks like it is still working, forever.

Two separate problems, both need fixing:
1. Very long prompts are silently dropped. Alibaba's Wan models themselves only accept roughly 800 characters of prompt, so even a 3,000-character prompt would have been rejected upstream.
2. When submission fails, the user is never told. The failure is invisible in both the chat composer and the request history.

## The fix

### 1. Long prompts get condensed instead of dropped
- Before submitting to Alibaba, if the creative prompt exceeds the model's safe limit, condense it with the existing Gemini gateway into a tight shot description under the limit, preserving subject, action, camera, lighting and style, and dropping the timeline/dialogue/negative-instruction blocks Wan cannot follow anyway.
- If condensing is unavailable, fall back to a hard trim rather than a hard error.
- Keep the original full prompt in the request history record; only the model receives the condensed version.

### 2. Submission failures become visible
- Whenever `wan-video` returns any error path (prompt problem, media problem, provider rejection, network error), the request row is marked `auto_failed` with a clear reason before the response returns, never left untouched.
- The chat composer surfaces that reason in the message bubble instead of spinning, and stops polling.
- Request history / dashboard shows an "Attention needed" state with the reason for `auto_failed` rows instead of "Processing".

### 3. Recover this specific request
- Re-submit the stuck request with the condensed prompt so the user gets their video, or mark it clearly failed with a message telling them the prompt was too long, depending on your preference below.

## Technical notes

- `supabase/functions/wan-video/index.ts`: replace the `prompt.length > 4000` hard reject with a condense-then-submit step; route every early return through `markFailed` so no row is left silent.
- New condensing helper calls the Lovable AI Gateway with `google/gemini-3-flash-preview` (already used elsewhere in the app), non-streaming, short output.
- `src/hooks/useMultimodalChat.ts`: treat `auto_failed = true` as a terminal state in the poll loop and render `failure_reason`.
- Request history status mapping: `auto_failed` rows stop mapping to the unified "Processing" state.
- No schema changes; `failure_reason` already exists.

## Open question

Should the stuck request be automatically retried with the condensed prompt once the fix is live, or just marked failed so the user can resubmit themselves?
