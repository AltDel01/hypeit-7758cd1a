
import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  isResetActive: boolean;
  isAnalyzing: boolean;
  isAnalyzeDisabled: boolean;
  handleReset: () => void;
  handleAnalyze: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isResetActive,
  isAnalyzing,
  isAnalyzeDisabled,
  handleReset,
  handleAnalyze
}) => {
  return (
    <div className="mt-8 flex gap-4">
      <Button 
        variant={isResetActive ? "newPurple" : "outline"} 
        onClick={handleReset}
        className={`w-32 h-12 text-base ${isResetActive ? '' : 'bg-black text-white border-black hover:bg-[#1A1F2C]'}`}
      >
        Reset
      </Button>
      <Button 
        variant={isAnalyzeDisabled ? "outline" : "newPurple"}
        onClick={handleAnalyze}
        disabled={isAnalyzing || isAnalyzeDisabled}
        className={`w-32 h-12 text-base ${isAnalyzeDisabled ? 'bg-black text-white border-black hover:bg-[#1A1F2C]' : ''}`}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
      </Button>
    </div>
  );
};

export default ActionButtons;
