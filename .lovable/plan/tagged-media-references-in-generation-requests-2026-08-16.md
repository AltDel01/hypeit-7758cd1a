# Tagged media references in generation requests

Today every uploaded file in the composer is just "attachment 1, 2, 3". The system guesses its purpose from count and mode (1 image = first frame, 2+ = reference-to-video, etc.). The plan adds an explicit **role tag** on every upload, carries that tag through to the provider, and shows it everywhere the request is displayed.

## Roles

Each uploaded file gets a role chip on its thumbnail, with a sensible default and a dropdown to change it:

- Reference (default)
- First frame
- Last frame
- Product
- Face / character
- Style reference
- Source video
- Audio / voice
- Mask

Only roles valid for the current mode are offered (e.g. Mask only in image mode, First/Last frame only in video mode).

## Behaviour

1. **Composer** — each thumbnail shows a small role chip; clicking it opens the role picker. Defaults keep today's behaviour so nothing changes for users who ignore it.
2. **Routing** — role tags replace the guessing rules: first frame + last frame roles pick keyframe-to-video, 2+ reference/product roles pick reference-to-video, a face role plus a source video picks face swap, audio plus a portrait picks lip sync. Guessing stays only as a fallback when every upload is left on the default role.
3. **Recorded prompt** — the stored prompt keeps a readable tag line, e.g. `| Media: 1 Product (shoe.jpg), 2 Style reference (mood.png)`, so the tags appear in history, the editor workspace and the request email.
4. **Detail views** — the References panel in the request detail, admin and editor workspaces labels each thumbnail with its role instead of "Reference 1".

## Where

- Homepage / dashboard chat composer (main image + video generation)
- Video Editor (Editor tab) uploads
- Creative Workflow asset uploads

## Technical notes

- New shared type `MediaRole` and helpers in `src/utils/requestMedia.ts`; roles are persisted alongside the existing `storage:bucket/path` refs using a `#role=` suffix, so existing rows keep parsing unchanged.
- `useMultimodalChat.send` accepts `{ file, role }[]` instead of `File[]`; category selection in `runGeneration` is driven by roles, with the current heuristics kept as the fallback branch.
- `createGenerationRequest` maps roles to the existing fields (`firstFrameUrl`, `lastFrameUrl`, `referenceImageUrls`, `audioUrl`, `maskUrl`), so `wan-video` and `qwen-image` edge functions need no payload change; `wan-video`'s prompt cleaner gets `Media` added to the stripped settings keys.
- No database migration: tags live inside the existing `reference_image_url` and `prompt` columns.
