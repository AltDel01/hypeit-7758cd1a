# AI Editor tab: make the 11 feature buttons real

## Straight answer

None of the 11 buttons in the AI Editor tab currently do anything real.

In `AIEditorPrompt.tsx` the buttons only toggle a chip and show a toast. The "Create" action runs a 2-second `setTimeout` and then shows a bundled demo file (`jake-paul-demo.mp4`) as the "AI Enhanced" result, for every feature and every upload. Nothing is uploaded to storage, no request is created, no credits are deducted, and nothing appears in history or the editor queue.

Status per feature (all in the same state): AI Edit, iPhone Quality, Trim, Caption, B-roll, Transitions, Effects, Zoom, Thumbnail Generator, Censor Word, Language Dubbing, all UI-only in this tab.

What does work elsewhere:
- The AI B-roll tab (`BrollStudio`) is a real pipeline: Gemini plan, Veo clip generation, browser compositing.
- The Tuning Deck (Captions/Visuals/Export) is also presentational, its Export button has no handler.

## What to build

Replace the fake create flow with the real submission pipeline the rest of the app already uses.

1. Upload the selected video/audio to storage and keep the `storage:bucket/path` reference (same convention as the rest of the app).
2. Build the prompt with the selected feature tags and the technical parameters (aspect ratio, resolution, duration, frames, start/end timestamps) using the existing bracket + pipe metadata format.
3. Check the credit balance before submit, then call `createGenerationRequest` so the job lands in history, the editor queue, and the email notifications, exactly like the homepage feature modes.
4. Replace the "generated" screen with the real request state: Processing, then the actual result media resolved through `resolveResultUrl`. Remove the demo video fallback entirely.
5. Route by feature where a real automated path exists:
   - B-roll: hand off to the existing `BrollStudio` pipeline instead of the queue.
   - Thumbnail Generator: generate directly through the existing Qwen image function.
   - The other nine: submit to the human editor fulfillment queue with the feature tags attached, matching how the homepage special modes behave today.
6. Wire the Tuning Deck settings (caption style, position, active-word colour, zoom aggression, face tracking, b-roll frequency, upscale, smooth) into the submitted prompt metadata so the editor receives them, and hook the Export button to the resulting file.

## Technical notes

- Files touched: `src/components/dashboard/sections/video-editor/AIEditorPrompt.tsx` (main rewrite of the create flow), `TuningDeck.tsx` plus its three tabs (lift state up), and a small shared submit helper.
- Reuse `createGenerationRequest`, `useUserCredits`, the prompt metadata format, and `resolveResultUrl`. No new tables or edge functions.
- Delete the `jake-paul-demo.mp4` import so no dummy asset can be shown as a result.

## Suggested order

1. Real submit + history + credits for all 11 features (queue-backed).
2. B-roll and Thumbnail direct automated paths.
3. Tuning Deck settings pass-through and working Export.
