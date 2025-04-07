
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  isGenerating: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const GenerateButton = ({ isGenerating, disabled = false, onClick }: GenerateButtonProps) => {
  return (
    <div className="flex justify-center mt-5">
      <Button 
        className="bg-[#8c52ff] hover:bg-[#7a45e6] px-6 h-8 text-sm"
        disabled={disabled || isGenerating}
        onClick={onClick}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <ArrowUp className="mr-1 h-3.5 w-3.5" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerateButton;
