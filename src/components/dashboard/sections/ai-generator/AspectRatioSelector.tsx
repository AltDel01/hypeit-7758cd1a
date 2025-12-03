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
    <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
      <Label className="text-white font-semibold mb-4 block">Aspect Ratio</Label>
      <div className="flex gap-4">
        {ratioOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRatioChange(option.value)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
              selectedRatio === option.value
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
            )}
          >
            <div
              className={cn(
                "border-2 rounded-sm",
                selectedRatio === option.value
                  ? "border-cyan-400 bg-cyan-900/30"
                  : "border-slate-500 bg-slate-700/50"
              )}
              style={{ width: option.width, height: option.height }}
            />
            <span className={cn(
              "text-sm font-medium",
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
