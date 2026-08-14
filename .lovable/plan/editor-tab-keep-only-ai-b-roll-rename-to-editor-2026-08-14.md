# Editor tab: keep only AI B-roll, rename to "Editor"

## The 8-second question, answered

The 8 seconds is a hard cap on each **generated b-roll clip**, not on the video being edited.

- Veo through the AI Gateway accepts only `4`, `6`, or `8` seconds per clip. There is no longer option on the paid API either, it is a model limit, not a free-tier limit. 1080p and 4k clips must be exactly 8 seconds.
- The source video the user uploads is not capped at 8 seconds. B-roll Studio samples frames from the whole video, and the AI proposes several cutaway moments across it.
- Longer b-roll coverage is achieved by generating multiple clips and stitching them at different timestamps, which is what the compositing step already does. Each individual insert stays 4 to 8 seconds.

Current setting in `broll-generate`: clips default to 4 seconds, allowed values 4/6/8. If longer inserts are wanted, the only path is chaining two clips back to back at adjacent timestamps.

## What to change in the UI

The AI Editor and Viral Clip tabs are UI-only mockups (fake timers, demo video result). B-roll is the only real pipeline, so:

1. In `AIVideoEditor.tsx`, remove the sub-tab bar and render `BrollStudio` directly.
2. Rename the section heading to "Editor" with a subtitle describing AI b-roll editing.
3. Keep the dashboard rail icon labelled "Editor" as it is.
4. Leave `AIEditorPrompt.tsx`, `ViralClipsDashboard.tsx`, and the supporting mock components on disk but unreferenced, so they can be revived when their backends are built. No other behaviour changes.

## Optional follow-up (not in this change)

Expose a clip-length control (4 / 6 / 8s) in B-roll Studio and pass it to `broll-generate`, which already accepts a `seconds` value.
