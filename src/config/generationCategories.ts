/**
 * Generation categories: maps the homepage hero choices and dashboard `?mode=`
 * URL param to the actual model + provider that fulfills the request.
 *
 * Decompose Editing ships as "Coming Soon" (UI only). Video Editing stays
 * fully manual via the existing editor queue (no AI dispatch).
 */

export type GenerationCategory =
  | 'image-gen'
  | 'image-edit-instruction'
  | 'image-edit-decompose'
  | 'video-t2v'
  | 'video-i2v'
  | 'video-r2v'
  | 'video-face-swap'
  | 'video-edit-manual';

export type AutoProvider = 'qwen' | 'wan' | 'hf-layered' | null;

export interface CategoryMeta {
  category: GenerationCategory;
  /** UI label */
  label: string;
  /** Underlying request_type column value (kept for backwards compat) */
  requestType: 'image' | 'video';
  /** Which provider attempts this. `null` = manual editor only. */
  provider: AutoProvider;
  /** Default model id for free/starter tier */
  modelDefault: string | null;
  /** Premium model id for pro/specialist tier (null = same as default) */
  modelPro: string | null;
  /** Whether this category is currently shipped */
  enabled: boolean;
  /** Async (Wan video) vs sync (Qwen image) provider call */
  async: boolean;
  /** Base credit cost (Free/Starter tier) */
  baseCredits: number;
  /** Pro tier cost (if provider supports it) */
  proCredits: number;
}

export const CATEGORY_MAP: Record<GenerationCategory, CategoryMeta> = {
  'image-gen': {
    category: 'image-gen',
    label: 'Image Generation',
    requestType: 'image',
    provider: 'qwen',
    modelDefault: 'qwen-image-2.0',
    modelPro: 'qwen-image-2.0-pro',
    enabled: true,
    async: false,
    baseCredits: 50,
    proCredits: 80,
  },
  'image-edit-instruction': {
    category: 'image-edit-instruction',
    label: 'Instruction Editing',
    requestType: 'image',
    provider: 'qwen',
    modelDefault: 'qwen-image-2.0-pro',
    modelPro: 'qwen-image-2.0-pro',
    enabled: true,
    async: false,
    baseCredits: 80,
    proCredits: 80,
  },
  'image-edit-decompose': {
    category: 'image-edit-decompose',
    label: 'Decompose Editing',
    requestType: 'image',
    provider: 'hf-layered',
    modelDefault: 'Qwen/Qwen-Image-Layered',
    modelPro: 'Qwen/Qwen-Image-Layered',
    enabled: false, // Coming soon
    async: true,
    baseCredits: 60,
    proCredits: 60,
  },
  'video-t2v': {
    category: 'video-t2v',
    label: 'Text to Video',
    requestType: 'video',
    provider: 'wan',
    modelDefault: 'wan2.7-t2v',
    modelPro: 'wan2.7-t2v',
    enabled: true,
    async: true,
    baseCredits: 250,
    proCredits: 250,
  },
  'video-i2v': {
    category: 'video-i2v',
    label: 'Image to Video',
    requestType: 'video',
    provider: 'wan',
    modelDefault: 'wan2.7-i2v',
    modelPro: 'wan2.7-i2v',
    enabled: true,
    async: true,
    baseCredits: 250,
    proCredits: 250,
  },
  'video-r2v': {
    category: 'video-r2v',
    label: 'Reference to Video',
    requestType: 'video',
    provider: 'wan',
    modelDefault: 'wan2.7-r2v',
    modelPro: 'wan2.7-r2v',
    enabled: true,
    async: true,
    baseCredits: 250,
    proCredits: 250,
  },
  'video-face-swap': {
    category: 'video-face-swap',
    label: 'Face Swap',
    requestType: 'video',
    provider: 'wan',
    modelDefault: 'wan2.2-animate-mix',
    modelPro: 'wan2.2-animate-mix',
    enabled: true,
    async: true,
    baseCredits: 300,
    proCredits: 300,
  },
  'video-edit-manual': {
    category: 'video-edit-manual',
    label: 'Video Editing',
    requestType: 'video',
    provider: null, // manual only
    modelDefault: null,
    modelPro: null,
    enabled: true,
    async: false,
    baseCredits: 50, // existing manual cost; recalculated by calculateCreditCost
    proCredits: 50,
  },
};

/**
 * Categories the user can land on directly via `?mode=` from the hero.
 * `image-edit` is a UI grouping (tabs); it routes to image-edit-instruction
 * by default with a Decompose tab marked "Coming Soon".
 */
export type HeroMode =
  | 'image-gen'
  | 'image-edit'
  | 'video-t2v'
  | 'video-i2v'
  | 'video-r2v'
  | 'video-face-swap'
  | 'video-edit';

export function heroModeToCategory(mode: HeroMode): GenerationCategory {
  switch (mode) {
    case 'image-edit':
      return 'image-edit-instruction';
    case 'video-edit':
      return 'video-edit-manual';
    default:
      return mode as GenerationCategory;
  }
}

export function isProTier(tier: string | null | undefined): boolean {
  if (!tier) return false;
  const t = tier.toLowerCase();
  return t === 'pro' || t === 'specialist' || t === 'enterprise';
}

export function pickModel(category: GenerationCategory, tier: string | null | undefined): string | null {
  const meta = CATEGORY_MAP[category];
  if (!meta.provider) return null;
  return isProTier(tier) ? meta.modelPro : meta.modelDefault;
}

export function pickCredits(category: GenerationCategory, tier: string | null | undefined): number {
  const meta = CATEGORY_MAP[category];
  return isProTier(tier) ? meta.proCredits : meta.baseCredits;
}
