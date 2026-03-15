/**
 * Credit cost configuration for generation requests.
 * Total Cost = (baseCost + featureAddOns) × qualityMultiplier × durationMultiplier
 */

export const BASE_COSTS: Record<string, number> = {
  aiclip: 60,
  retention: 40,
  creator: 50,
  aiedit: 20,
  default: 10,
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

export function calculateCreditCost({
  activeMode,
  selectedFeatures,
  resolution,
  duration,
}: {
  activeMode: string | null;
  selectedFeatures: string[];
  resolution: string;
  duration: string;
}): CreditCostResult {
  // Base cost from tool mode
  const modeKey = activeMode || 'default';
  const baseCost = BASE_COSTS[modeKey] ?? BASE_COSTS.default;

  // Feature add-on costs
  let featureCost = 0;
  const breakdown: BreakdownItem[] = [];

  const modeLabel = activeMode === 'aiclip' ? 'AI Clip'
    : activeMode === 'retention' ? 'Retention Editing'
    : activeMode === 'creator' ? 'AI Creator'
    : activeMode === 'aiedit' ? 'AI Edit'
    : 'Base';

  breakdown.push({ label: modeLabel, value: baseCost, type: 'base' });

  for (const featureId of selectedFeatures) {
    const cost = FEATURE_ADDON_COSTS[featureId];
    if (cost) {
      featureCost += cost;
      const featureLabel = featureId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      breakdown.push({ label: featureLabel, value: cost, type: 'addon' });
    }
  }

  const qualityMultiplier = QUALITY_MULTIPLIERS[resolution] ?? 1.0;
  const durationMultiplier = DURATION_MULTIPLIERS[duration] ?? 1.0;

  if (resolution && QUALITY_MULTIPLIERS[resolution]) {
    breakdown.push({ label: `Quality (${resolution})`, value: qualityMultiplier, type: 'multiplier' });
  }
  if (duration && DURATION_MULTIPLIERS[duration]) {
    breakdown.push({ label: `Duration (${duration})`, value: durationMultiplier, type: 'multiplier' });
  }

  const subtotal = baseCost + featureCost;
  const totalCost = Math.ceil(subtotal * qualityMultiplier * durationMultiplier);

  return {
    totalCost,
    baseCost,
    featureCost,
    qualityMultiplier,
    durationMultiplier,
    breakdown,
  };
}
