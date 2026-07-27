## Diagnosis (verified against the live provider)

The API key is **fine**. I called DashScope directly with your `QWEN_API_KEY`:

| Model ID we send | Provider response |
|---|---|
| `qwen-image-3.0` | 400 `InvalidParameter: Model not exist.` |
| `qwen-image-3.0-pro` | 403 `AccessDenied` |
| `qwen-image` | 400 only about size (model works) |
| `qwen-image-plus` | 400 only about size (model works) |
| `qwen-image-edit` | 400 only about missing input image (model works) |

Two separate bugs:

1. **The `qwen-image-3.0` / `-3.0-pro` model IDs don't exist on DashScope International.** They were set when we "upgraded" to Qwen-Image-3.0. Every image request since then fails: gen → "Provider error (400)", instruction edit → 403, which our error mapper mislabels as "Provider rejected the API key".
2. **Our sizes are invalid.** `qwen-image` only accepts `1664*928`, `1472*1104`, `1328*1328`, `1104*1472`, `928*1664`. We send `1024*1024`, `1280*720`, etc., so even with a correct model the request would 400.

Video (Wan) failures are a different, older issue (tasks the provider lost / moderation blocks), not the API key.

## Fix

**1. `src/config/generationCategories.ts`**
- `image-gen`: `modelDefault: 'qwen-image'`, `modelPro: 'qwen-image-plus'`
- `image-edit-instruction`: `modelDefault` / `modelPro`: `'qwen-image-edit'`

**2. `src/services/generationRequestService.ts`**
- Rewrite `aspectRatioToSize` to map to the provider's allowed sizes:
  - 1:1 → `1328*1328`, 16:9 / 21:9 → `1664*928`, 9:16 → `928*1664`, 4:3 → `1472*1104`, 3:4 → `1104*1472`, default → `1328*1328`.

**3. `supabase/functions/qwen-image/index.ts`**
- Whitelist the five allowed sizes server-side and snap anything else to the nearest one, so a stale client can never 400.
- Fix the error mapper: only report "API key rejected" for `InvalidApiKey` / 401; map `AccessDenied` and `Model not exist` to "This model isn't available on the account, an editor will take over" so we never again misdiagnose a key problem.
- Redeploy the function.

**4. Recover the stuck requests**
- Leave the 2 failed image requests in the editor queue as-is (they're already routed to manual fulfilment); after the fix they can be retried automatically. I'll confirm one real generation end-to-end through the live function before calling it done.

## Note on Qwen-Image-3.0
It isn't exposed on the Singapore/International DashScope endpoint for this account (403 AccessDenied). If you want 3.0 specifically, it needs either the Beijing/China endpoint or model access enabled in Model Studio for this account. `qwen-image-plus` is the best available text-rendering model on the current endpoint.
