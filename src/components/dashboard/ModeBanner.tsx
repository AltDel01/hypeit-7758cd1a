import React from 'react';
import { GenerationCategory, CATEGORY_MAP } from '@/config/generationCategories';
import { Sparkles, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModeBannerProps {
  category: GenerationCategory;
}

const PROVIDER_LABEL: Record<string, string> = {
  qwen: 'Qwen AI',
  wan: 'Wan AI',
  'hf-layered': 'Qwen Layered',
};

/**
 * Compact banner shown above the dashboard workspace when the user lands
 * from a specific homepage hero choice. Communicates which workflow is
 * active and whether it is AI-fulfilled or hand-crafted by editors.
 */
const ModeBanner: React.FC<ModeBannerProps> = ({ category }) => {
  const meta = CATEGORY_MAP[category];
  if (!meta) return null;

  const isManual = !meta.provider;
  const isComingSoon = !meta.enabled;

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#8C52FF]/10 via-[#8C52FF]/5 to-cyan-500/10 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8C52FF]/20">
            {isManual ? (
              <Wrench className="h-4 w-4 text-amber-300" />
            ) : (
              <Sparkles className="h-4 w-4 text-[#c4a8ff]" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {meta.label}
              {isComingSoon && (
                <Badge variant="outline" className="ml-2 border-amber-400/40 text-amber-300">
                  Coming Soon
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {isManual
                ? 'Hand-crafted by our editors. Typically delivered within minutes.'
                : `Auto-generated via ${PROVIDER_LABEL[meta.provider!] || meta.provider}. Editors take over if anything fails.`}
            </div>
          </div>
        </div>
        {!isManual && meta.modelDefault && (
          <Badge variant="secondary" className="font-mono text-[10px]">
            {meta.modelDefault}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ModeBanner;
