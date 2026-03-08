/**
 * Parse a generation request prompt string into structured parts.
 * Format: "[Feature1, Feature2] actual prompt | Aspect: 9:16 | Resolution: 1080P | Duration: 15s | Timeline: 00:00-00:15"
 */
export interface ParsedPrompt {
  features: string[];
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  duration?: string;
  timeline?: string;
}

export function parsePromptString(raw: string): ParsedPrompt {
  let features: string[] = [];
  let rest = raw;

  // Extract [Feature1, Feature2] or [AI Edit] prefix
  const featureMatch = rest.match(/^\[([^\]]+)\]\s*/);
  if (featureMatch) {
    features = featureMatch[1].split(',').map(f => f.trim()).filter(Boolean);
    rest = rest.slice(featureMatch[0].length);
  }

  // Split by pipe separator
  const parts = rest.split('|').map(p => p.trim());
  const prompt = parts[0] || '';

  const settings: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const [key, ...valueParts] = parts[i].split(':');
    if (key && valueParts.length > 0) {
      settings[key.trim().toLowerCase()] = valueParts.join(':').trim();
    }
  }

  return {
    features,
    prompt,
    aspectRatio: settings['aspect'],
    resolution: settings['resolution'],
    duration: settings['duration'],
    timeline: settings['timeline'],
  };
}
