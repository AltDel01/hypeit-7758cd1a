

# Credit Deduction System — Full Implementation Plan

## Overview

Implement a variable credit cost system where generation cost depends on the selected tool mode, feature add-ons, video quality, and duration. Add a live cost preview near the Generate button, a breakdown tooltip, and a low-credit warning.

## 1. Credit Cost Configuration

Create `src/config/creditCosts.ts` with all cost constants:

```text
BASE COSTS (by tool mode):
  AI Clip:            60
  Retention Editing:  40
  AI Creator:         50
  AI Edit:            20
  Default (no mode):  10

FEATURE ADD-ON COSTS:
  Language Dubbing:   25
  B-roll:             15
  Caption:            10
  Transitions:        10
  Effects:            10
  iPhone Quality:     5
  Trim:               5
  Zoom:               5
  Thumbnail:          5
  Censor Word:        5

QUALITY MULTIPLIERS:
  480P: 0.5x | 720P: 1.0x | 1080P: 1.5x | 4K: 3.0x | Default: 1.0x

DURATION MULTIPLIERS:
  5s: 1.0x | 10s: 1.8x | 15s: 2.5x | 30s: 4.0x | 60s: 7.0x | Default: 1.0x
```

Export a `calculateCreditCost()` function that takes `{ activeMode, selectedFeatures, resolution, duration }` and returns `{ totalCost, baseCost, featureCost, qualityMultiplier, durationMultiplier, breakdown[] }`.

## 2. Database Changes

**Add `credits_used` column to `generation_requests`:**
```sql
ALTER TABLE generation_requests
  ADD COLUMN credits_used integer NOT NULL DEFAULT 10;
```

**Replace `track_generation_usage` trigger** to deduct `credits_used` instead of flat +1:
```sql
CREATE OR REPLACE FUNCTION public.track_generation_usage()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET generations_this_month = generations_this_month + NEW.credits_used
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;
```

This means `generations_this_month` now tracks total credits consumed (not count), and `monthly_generation_limit` becomes the credit cap matching the pricing tiers (500 / 3000 / 8000 / 26000).

**Update default limits per tier** — when users sign up or change tier, set `monthly_generation_limit` accordingly.

## 3. Frontend: Live Credit Cost Preview

**New component: `src/components/dashboard/CreditCostPreview.tsx`**

A small badge displayed next to the Generate/Submit button showing the real-time calculated cost (e.g., "⚡ 85 credits"). Updates reactively as users change mode, features, quality, and duration.

On hover, shows a tooltip breakdown:
```text
  Base (AI Clip):        60
  + Caption:             10
  + B-roll:              15
  × Quality (1080P):    1.5x
  × Duration (10s):     1.8x
  ─────────────────────
  Total:                229 credits
```

## 4. Frontend: Low-Credit Warning

Before submission, check `profile.monthly_generation_limit - profile.generations_this_month` against calculated cost. If insufficient:
- Show a warning toast: "Not enough credits. You need X but have Y remaining."
- Suggest: "Try lowering quality or duration, or upgrade your plan."
- Block submission and show an "Upgrade Plan" link to `/pricing`.

If credits are low but sufficient (< 20% remaining after this generation), show a yellow warning badge on the cost preview.

## 5. Service Layer Changes

**Update `createGenerationRequest`** in `generationRequestService.ts`:
- Accept a new `creditsUsed` parameter
- Include it in the insert payload
- Before inserting, fetch user profile to check remaining credits; reject if insufficient

## 6. Credit Usage Page Updates

**Update `src/pages/CreditUsage.tsx`:**
- Query `generation_requests` instead of `generated_images` for usage history
- Display `credits_used` per request instead of hardcoded `1`
- Show proper action labels parsed from the prompt (using `parsePromptString`)

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/config/creditCosts.ts` | **Create** — cost config + calculator |
| `src/components/dashboard/CreditCostPreview.tsx` | **Create** — live badge + tooltip |
| `src/components/dashboard/SimplifiedDashboard.tsx` | **Modify** — integrate cost preview, pre-submit check |
| `src/services/generationRequestService.ts` | **Modify** — add `creditsUsed` param, balance check |
| `src/pages/CreditUsage.tsx` | **Modify** — use `generation_requests` + variable costs |
| DB migration | **Run** — add `credits_used` column, update trigger |

## Technical Notes

- The cost calculation is purely client-side for real-time preview; the server (trigger) handles the actual deduction from the profile balance
- `generations_this_month` is repurposed from "count" to "total credits consumed" — this is backward-compatible since existing users have low counts
- The monthly reset function (`reset_monthly_usage`) continues to work as-is

