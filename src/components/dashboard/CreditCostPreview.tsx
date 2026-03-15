import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { calculateCreditCost, CreditCostResult } from '@/config/creditCosts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CreditCostPreviewProps {
  activeMode: string | null;
  selectedFeatures: string[];
  resolution: string;
  duration: string;
  remainingCredits: number;
}

const CreditCostPreview: React.FC<CreditCostPreviewProps> = ({
  activeMode,
  selectedFeatures,
  resolution,
  duration,
  remainingCredits,
}) => {
  const cost = calculateCreditCost({ activeMode, selectedFeatures, resolution, duration });
  const isInsufficient = cost.totalCost > remainingCredits;
  const isLow = !isInsufficient && remainingCredits - cost.totalCost < remainingCredits * 0.2;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default transition-colors ${
              isInsufficient
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isLow
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-gray-800/80 text-gray-300 border border-gray-700/50'
            }`}
          >
            {isInsufficient ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>{cost.totalCost} credits</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900 border-gray-700 text-gray-200 p-3 max-w-[240px]"
        >
          <BreakdownTooltip cost={cost} remainingCredits={remainingCredits} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const BreakdownTooltip: React.FC<{ cost: CreditCostResult; remainingCredits: number }> = ({
  cost,
  remainingCredits,
}) => {
  const bases = cost.breakdown.filter(b => b.type === 'base' || b.type === 'addon');
  const multipliers = cost.breakdown.filter(b => b.type === 'multiplier');

  return (
    <div className="space-y-1.5 text-xs">
      <p className="font-semibold text-gray-100 mb-1">Cost Breakdown</p>
      {bases.map((item, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-gray-400">
            {item.type === 'addon' ? '+ ' : ''}{item.label}
          </span>
          <span className="text-gray-200 font-medium">{item.value}</span>
        </div>
      ))}
      {multipliers.map((item, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-gray-400">× {item.label}</span>
          <span className="text-gray-200 font-medium">{item.value}x</span>
        </div>
      ))}
      <div className="border-t border-gray-700 pt-1.5 flex justify-between gap-4">
        <span className="text-gray-300 font-semibold">Total</span>
        <span className="text-white font-bold">{cost.totalCost}</span>
      </div>
      <div className="flex justify-between gap-4 text-gray-500">
        <span>Remaining</span>
        <span>{remainingCredits}</span>
      </div>
      {cost.totalCost > remainingCredits && (
        <p className="text-red-400 mt-1">
          Not enough credits. Try lowering quality or duration.
        </p>
      )}
    </div>
  );
};

export default CreditCostPreview;
