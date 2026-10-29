# Switch image and video generation to BytePlus ModelArk

Every feature that makes images or videos moves from Alibaba to BytePlus ModelArk. Text features (chat, trends, scripts, brand scan) stay on Qwen, since you asked only about images and videos.

## What changes for users
Nothing visible. The homepage generator, dashboard tools, Creative Workflow Day-1 to Day-7 media, Editor B-roll and thumbnails, image editing, and the Studio page all produce results from ModelArk. History, emails, credits and friendly error messages keep working the same way.

## Models
- Images (generate and edit with reference photos, including the workflow product photo): Dola-Seedream-5.0-pro
- Videos (text-to-video, image-to-video, first/last frame, reference images): Dreamina-Seedance-2.5

## Limits to know about
- Before switching, I'll check Seedance 2.5's real limits with your key (longest clip, resolutions, aspect ratios). Any duration option it can't do (for example 20s or 30s) gets removed or capped, so users never get a shorter video than they picked.
- Lip Sync has no ModelArk equivalent. It stays on Alibaba unless you want it hidden.
- Videos already processing on Alibaba finish on Alibaba; only new requests use ModelArk.

## Steps
1. Save your ModelArk key securely (secure form, after you approve).
2. Build one shared ModelArk helper: create image, create video task, check task, friendly errors, reference image upload.
3. Switch every image function (homepage/dashboard image, inpaint/edit, workflow images, thumbnails) to Seedream.
4. Switch every video function (homepage/dashboard video, Studio, B-roll, workflow videos) to Seedance, and update the background checker so videos finish even if the page is closed.
5. Update the duration and resolution choices in the generator, Studio and Creative Workflow to match Seedance.
6. Run one real image and one real video through ModelArk, and keep small tests for duration limits and product-photo references.

## Technical details
- New `_shared/modelark.ts` (base `https://ark.ap-southeast.bytepluses.com/api/v3`, `/images/generations`, `/contents/generations/tasks`), secret `ARK_API_KEY`.
- Rewire `qwen-image`, `dashscope-inpaint`, `wan-video`, `wan-video-poll`, `wan-video-cron`, `wan-video-backfill`, `veo-studio`, `broll-generate`, `generate-creative-asset`, `workflowProductPhoto`. Function names kept so the app needs no route changes.
- Provider stored per request so in-flight Alibaba tasks still poll Alibaba.
- Model IDs kept in one config so they can be swapped without code changes.
