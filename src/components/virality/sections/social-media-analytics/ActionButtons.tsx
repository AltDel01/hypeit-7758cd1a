
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
    <div className="flex justify-end space-x-3 pt-4">
      {isResetActive && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="bg-transparent border border-gray-700 text-white hover:bg-gray-800"
        >
          Reset
        </Button>
      )}
      
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
