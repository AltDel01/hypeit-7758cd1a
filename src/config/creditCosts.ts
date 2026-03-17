/**
 * Credit cost configuration for generation requests.
 * Total Cost = (baseCost + featureAddOns) × qualityMultiplier × durationMultiplier
 * Minimum floors: Video = 50, Image = 30
 */

export const BASE_COSTS: Record<string, number> = {
  aiclip: 70,
  retention: 50,
  creator: 50,
  aiedit: 40,
  default: 50,
};

export const FEATURE_ADDON_COSTS: Record<string, number> = {
  'change-language': 25,
  'b-roll': 15,
  'caption': 10,
  'transitions': 10,
  'effects': 10,
  'iphone-quality': 5,
  'trim': 5,
  'zoom': 5,
  'thumbnail': 5,
  'censor-word': 5,
};

export const QUALITY_MULTIPLIERS: Record<string, number> = {
  '480P': 0.5,
  '720P': 1.0,
  '1080P': 1.5,
  '4K': 3.0,
};

export const DURATION_MULTIPLIERS: Record<string, number> = {
  '5s': 1.0,
  '10s': 1.8,
  '15s': 2.5,
  '30s': 4.0,
  '60s': 7.0,
};

// Minimum cost floors
export const MIN_COST_VIDEO = 50;
export const MIN_COST_IMAGE = 30;

export interface BreakdownItem {
  label: string;
  value: number;
  type: 'base' | 'addon' | 'multiplier';
}

export interface CreditCostResult {
  totalCost: number;
  baseCost: number;
  featureCost: number;
  qualityMultiplier: number;
  durationMultiplier: number;
  breakdown: BreakdownItem[];
}

// ─── Prompt-based settings extraction ───

interface PromptExtracted {
  resolution?: string;
  duration?: string;
  features: string[];
  modeOverride?: string;
}

const PROMPT_DURATION_PATTERNS: [RegExp, string][] = [
  [/\b60\s*(?:seconds?|sec|s)\b|(?:^|\s)60s\b|\b1\s*min(?:ute)?\b/i, '60s'],
  [/\b30\s*(?:seconds?|sec|s)\b|(?:^|\s)30s\b/i, '30s'],
  [/\b15\s*(?:seconds?|sec|s)\b|(?:^|\s)15s\b/i, '15s'],
  [/\b10\s*(?:seconds?|sec|s)\b|(?:^|\s)10s\b/i, '10s'],
  [/\b5\s*(?:seconds?|sec|s)\b|(?:^|\s)5s\b/i, '5s'],
];

const PROMPT_QUALITY_PATTERNS: [RegExp, string][] = [
  [/\b4k\b/i, '4K'],
  [/\b1080p?\b/i, '1080P'],
  [/\b720p?\b/i, '720P'],
  [/\b480p?\b/i, '480P'],
];

// Feature keyword → feature add-on ID
const PROMPT_FEATURE_KEYWORDS: [RegExp, string][] = [
  [/\biphone\s*quality\b/i, 'iphone-quality'],
  [/\btrim\b|\bcrop\b/i, 'trim'],
  [/\bcaption\b|\bcaptions\b|\bsubtitle/i, 'caption'],
  [/\bcolor\b/i, 'effects'],
  [/\bb[\s-]?roll\b/i, 'b-roll'],
  [/\btransition/i, 'transitions'],
  [/\beffect/i, 'effects'],
  [/\bzoom\s*in\b|\bzoom\s*out\b|\bzoom\b/i, 'zoom'],
  [/\bthumbnail\s*generator\b|\bthumbnail\b/i, 'thumbnail'],
  [/\bcensor\s*word\b|\bsilent\b/i, 'censor-word'],
  [/\blanguage\s*dubbing\b|\bdubbing\b/i, 'change-language'],
];

// Mode override keywords (only applied when no activeMode is set)
const PROMPT_MODE_KEYWORDS: [RegExp, string][] = [
  [/\bai\s*clip\b|\bclipping\b|\bclipper\b|\bclip\b/i, 'aiclip'],
  [/\bretention\s*editing\b|\bretention\b|\bhook\b/i, 'retention'],
  [/\bai\s*creator\b|\bavatar\b|\bugc\b|\bai\s*influencer\b/i, 'creator'],
  [/\bai\s*edit\b|\bmotion\b|\binsert\b|\bblur\b|\bscale\b|\bclear\b/i, 'aiedit'],
];

export function extractSettingsFromPrompt(prompt: string): PromptExtracted {
  if (!prompt) return { features: [] };

  let resolution: string | undefined;
  let duration: string | undefined;
  const features: string[] = [];
  let modeOverride: string | undefined;

  // Detect duration (first match wins — patterns ordered longest first)
  for (const [pattern, value] of PROMPT_DURATION_PATTERNS) {
    if (pattern.test(prompt)) {
      duration = value;
      break;
    }
  }

  // Detect quality
  for (const [pattern, value] of PROMPT_QUALITY_PATTERNS) {
    if (pattern.test(prompt)) {
      resolution = value;
      break;
    }
  }

  // Detect feature add-ons
  for (const [pattern, featureId] of PROMPT_FEATURE_KEYWORDS) {
    if (pattern.test(prompt) && !features.includes(featureId)) {
      features.push(featureId);
    }
  }

  // Detect mode override
  for (const [pattern, mode] of PROMPT_MODE_KEYWORDS) {
    if (pattern.test(prompt)) {
      modeOverride = mode;
      break;
    }
  }

  return { resolution, duration, features, modeOverride };
}

// ─── Main calculation ───

export function calculateCreditCost({
  activeMode,
  selectedFeatures,
  resolution,
  duration,
  prompt,
  requestType,
}: {
  activeMode: string | null;
  selectedFeatures: string[];
  resolution: string;
  duration: string;
  prompt?: string;
  requestType?: 'video' | 'image';
}): CreditCostResult {
  // Extract settings from prompt text
  const promptSettings = extractSettingsFromPrompt(prompt || '');

  // Merge: UI selections take priority; prompt fills in blanks
  const effectiveResolution = resolution || promptSettings.resolution || '';
  const effectiveDuration = duration || promptSettings.duration || '';
  const effectiveMode = activeMode || promptSettings.modeOverride || null;

  // Merge features: combine UI-selected + prompt-detected (no dupes)
  const mergedFeatures = [...selectedFeatures];
  for (const f of promptSettings.features) {
    if (!mergedFeatures.includes(f)) {
      mergedFeatures.push(f);
    }
  }

  // Base cost from tool mode
  const modeKey = effectiveMode || 'default';
  const baseCost = BASE_COSTS[modeKey] ?? BASE_COSTS.default;

  // Feature add-on costs
  let featureCost = 0;
  const breakdown: BreakdownItem[] = [];

  const modeLabel = effectiveMode === 'aiclip' ? 'AI Clip'
    : effectiveMode === 'retention' ? 'Retention Editing'
    : effectiveMode === 'creator' ? 'AI Creator'
    : effectiveMode === 'aiedit' ? 'AI Edit'
    : 'Base';

  breakdown.push({ label: modeLabel, value: baseCost, type: 'base' });

  for (const featureId of mergedFeatures) {
    const cost = FEATURE_ADDON_COSTS[featureId];
    if (cost) {
      featureCost += cost;
      const featureLabel = featureId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      breakdown.push({ label: featureLabel, value: cost, type: 'addon' });
    }
  }

  const qualityMultiplier = QUALITY_MULTIPLIERS[effectiveResolution] ?? 1.0;
  const durationMultiplier = DURATION_MULTIPLIERS[effectiveDuration] ?? 1.0;

  if (effectiveResolution && QUALITY_MULTIPLIERS[effectiveResolution]) {
    breakdown.push({ label: `Quality (${effectiveResolution})`, value: qualityMultiplier, type: 'multiplier' });
  }
  if (effectiveDuration && DURATION_MULTIPLIERS[effectiveDuration]) {
    breakdown.push({ label: `Duration (${effectiveDuration})`, value: durationMultiplier, type: 'multiplier' });
  }

  const subtotal = baseCost + featureCost;
  let totalCost = Math.ceil(subtotal * qualityMultiplier * durationMultiplier);

  // Apply minimum cost floor
  const floor = requestType === 'image' ? MIN_COST_IMAGE : MIN_COST_VIDEO;
  totalCost = Math.max(totalCost, floor);

  return {
    totalCost,
    baseCost,
    featureCost,
    qualityMultiplier,
    durationMultiplier,
    breakdown,
  };
}
