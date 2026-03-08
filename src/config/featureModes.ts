import { Sparkles, Smartphone, Scissors, Captions, Film, Layers, Wand2, Image, ZoomIn, MessageCircleOff, Languages, LucideIcon } from 'lucide-react';

export interface FeatureModeConfig {
  mode: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;        // primary accent color
  colorFrom: string;    // gradient from
  colorTo: string;      // gradient to
  shadowColor: string;  // shadow color class fragment
}

// Maps feature chip IDs to their mode config
export const FEATURE_MODE_MAP: Record<string, FeatureModeConfig> = {
  'ai-edit': {
    mode: 'aiedit',
    label: 'AI Edit',
    description: 'Smart auto-edit with effects & transitions',
    icon: Sparkles,
    color: '#f9a825',
    colorFrom: '#f9a825',
    colorTo: '#ff6f00',
    shadowColor: 'amber-500',
  },
  'iphone-quality': {
    mode: 'iphonequality',
    label: 'iPhone Quality',
    description: 'Upscale to HD quality',
    icon: Smartphone,
    color: '#4ade80',
    colorFrom: '#4ade80',
    colorTo: '#22c55e',
    shadowColor: 'green-500',
  },
  'trim': {
    mode: 'trim',
    label: 'Trim',
    description: 'Cut and trim clips',
    icon: Scissors,
    color: '#60a5fa',
    colorFrom: '#60a5fa',
    colorTo: '#3b82f6',
    shadowColor: 'blue-500',
  },
  'caption': {
    mode: 'caption',
    label: 'Caption',
    description: 'Add AI captions & subtitles',
    icon: Captions,
    color: '#fbbf24',
    colorFrom: '#fbbf24',
    colorTo: '#f59e0b',
    shadowColor: 'yellow-500',
  },
  'b-roll': {
    mode: 'broll',
    label: 'B-roll',
    description: 'Add AI-generated stock footage',
    icon: Film,
    color: '#a78bfa',
    colorFrom: '#a78bfa',
    colorTo: '#8b5cf6',
    shadowColor: 'violet-500',
  },
  'transitions': {
    mode: 'transitions',
    label: 'Transitions',
    description: 'Add smooth transitions between scenes',
    icon: Layers,
    color: '#f472b6',
    colorFrom: '#f472b6',
    colorTo: '#ec4899',
    shadowColor: 'pink-500',
  },
  'effects': {
    mode: 'effects',
    label: 'Effects',
    description: 'Apply visual effects & filters',
    icon: Wand2,
    color: '#fb923c',
    colorFrom: '#fb923c',
    colorTo: '#f97316',
    shadowColor: 'orange-500',
  },
  'zoom': {
    mode: 'zoom',
    label: 'Zoom',
    description: 'Add dynamic zoom effects',
    icon: ZoomIn,
    color: '#2dd4bf',
    colorFrom: '#2dd4bf',
    colorTo: '#14b8a6',
    shadowColor: 'teal-500',
  },
  'thumbnail': {
    mode: 'thumbnail',
    label: 'Thumbnail Generator',
    description: 'Create eye-catching thumbnails',
    icon: Image,
    color: '#e879f9',
    colorFrom: '#e879f9',
    colorTo: '#d946ef',
    shadowColor: 'fuchsia-500',
  },
  'censor-word': {
    mode: 'censorword',
    label: 'Censor Word',
    description: 'Automatically censor profanity',
    icon: MessageCircleOff,
    color: '#f87171',
    colorFrom: '#f87171',
    colorTo: '#ef4444',
    shadowColor: 'red-500',
  },
  'change-language': {
    mode: 'dubbing',
    label: 'Language Dubbing',
    description: 'Translate audio to any language',
    icon: Languages,
    color: '#38bdf8',
    colorFrom: '#38bdf8',
    colorTo: '#0ea5e9',
    shadowColor: 'sky-500',
  },
};

// Get config by mode key (reverse lookup)
export const getConfigByMode = (mode: string): FeatureModeConfig | undefined => {
  return Object.values(FEATURE_MODE_MAP).find(c => c.mode === mode);
};

// Get config by feature ID
export const getConfigByFeatureId = (featureId: string): FeatureModeConfig | undefined => {
  return FEATURE_MODE_MAP[featureId];
};

// All feature mode keys (for checking if a mode is a "feature mode")
export const ALL_FEATURE_MODES = Object.values(FEATURE_MODE_MAP).map(c => c.mode);

// Check if a mode is any feature mode (including aiedit)
export const isFeatureMode = (mode: string | null): boolean => {
  if (!mode) return false;
  return ALL_FEATURE_MODES.includes(mode);
};
