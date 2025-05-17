
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
    <div className="flex justify-end space-x-3">
      {/* Reset button is now handled in the parent component */}
      <Button
        variant="newPurple"
        onClick={handleAnalyze}
        disabled={isAnalyzeDisabled}
        className="min-w-[100px]"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing
          </>
        ) : (
          'Analyze'
        )}
      </Button>
    </div>
  );
};

export default ActionButtons;
