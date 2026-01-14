import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
}

const ratioOptions = [
  { value: '1:1', label: '1:1', width: 40, height: 40 },
  { value: '4:5', label: '4:5', width: 36, height: 45 },
  { value: '9:16', label: '9:16', width: 28, height: 50 },
  { value: '16:9', label: '16:9', width: 50, height: 28 },
];

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onRatioChange,
}) => {
  return (
    <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
      <Label className="text-white font-semibold mb-3 md:mb-4 block text-sm md:text-base">Aspect Ratio</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
        {ratioOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRatioChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-lg border-2 transition-all",
              selectedRatio === option.value
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
            )}
          >
            <div
              className={cn(
                "border-2 rounded-sm shrink-0",
                selectedRatio === option.value
                  ? "border-cyan-400 bg-cyan-900/30"
                  : "border-slate-500 bg-slate-700/50"
              )}
              style={{ 
                width: Math.max(option.width * 0.6, 16), 
                height: Math.max(option.height * 0.6, 16) 
              }}
            />
            <span className={cn(
              "text-xs md:text-sm font-medium",
              selectedRatio === option.value ? "text-cyan-300" : "text-slate-400"
            )}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default AspectRatioSelector;
