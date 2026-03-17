

# Update Credit Costs + Prompt-Based Credit Detection

## 1. Update base costs in `src/config/creditCosts.ts`

| Mode | Current | New |
|------|---------|-----|
| default | 10 | **50** |
| aiedit | 20 | **40** |
| retention | 40 | **50** |
| creator | 50 | **50** |
| aiclip | 60 | **70** |

## 2. Add minimum cost floors in `calculateCreditCost`

- Video requests: `Math.max(totalCost, 50)`
- Image requests: `Math.max(totalCost, 30)`
- Add `requestType` and `prompt` optional parameters to the function signature

## 3. New function: `extractSettingsFromPrompt(prompt)` in `creditCosts.ts`

Scans the raw prompt text (case-insensitive) for:

**Duration keywords** → map to duration multiplier:
- "5 seconds/5s" → 5s (1.0x)
- "10 seconds/10s" → 10s (1.8x)
- "15 seconds/15s" → 15s (2.5x)
- "30 seconds/30s" → 30s (4.0x)
- "60 seconds/60s/1 minute" → 60s (7.0x)

**Quality keywords** → map to resolution multiplier:
- "480p" → 0.5x
- "720p" → 1.0x
- "1080p" → 1.5x
- "4k" → 3.0x

**Feature keywords** → map to feature add-on costs (detected only if not already in `selectedFeatures`):
- "AI Edit", "Motion", "Insert", "Blur", "Scale", "Clear" → aiedit mode or effects add-on
- "iPhone Quality" → `iphone-quality` (+5)
- "Trim", "Crop" → `trim` (+5)
- "Caption" → `caption` (+10)
- "Color" → `effects` (+10)
- "B-roll" → `b-roll` (+15)
- "Transitions" → `transitions` (+10)
- "Effects" → `effects` (+10)
- "Zoom", "Zoom In", "Zoom Out" → `zoom` (+5)
- "Thumbnail", "Thumbnail Generator" → `thumbnail` (+5)
- "Censor Word", "Silent" → `censor-word` (+5)
- "Language Dubbing" → `change-language` (+25)
- "AI Clip", "Clipping", "Clipper", "Clip" → override activeMode to `aiclip`
- "Retention Editing", "Hook" → override activeMode to `retention`
- "AI Creator", "Avatar", "UGC", "AI Influencer" → override activeMode to `creator`

Logic: prompt-detected values only apply when the corresponding UI setting is unselected ("" or "Default"). UI selections always take priority.

## 4. Update `calculateCreditCost` flow

1. Call `extractSettingsFromPrompt(prompt)` to get detected resolution, duration, features, and mode override
2. Merge: if UI resolution is empty, use prompt-detected resolution; same for duration
3. Add prompt-detected features to selectedFeatures (no duplicates)
4. If prompt detects a tool mode and no activeMode is set, use prompt-detected mode for base cost
5. Calculate total, then apply `Math.max(total, floor)`

## 5. Update callers (4 call sites in `SimplifiedDashboard.tsx`)

Pass `prompt` (the raw user text) and `requestType: 'video'` to all `calculateCreditCost` calls at lines ~195, ~347, ~436, ~473.

## 6. Update `CreditCostPreview.tsx`

Add `prompt` and `requestType` props, pass through to `calculateCreditCost` so the live preview reflects prompt-based detection in real time.

## Result

- No settings, no prompt hints: `50 × 1 × 1 = 50 credits` (minimum floor)
- User types "make it 15 seconds 1080p": `50 × 1.5 × 2.5 = 188 credits`
- User types "add b-roll and captions, 30s 1080p": `(50+15+10) × 1.5 × 4.0 = 450 credits`
- User selects AI Clip + 1080P + 30s via UI: `70 × 1.5 × 4.0 = 420 credits`

