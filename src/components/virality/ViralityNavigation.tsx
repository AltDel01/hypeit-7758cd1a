
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface ViralityNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  isLastStep?: boolean;
}

const ViralityNavigation: React.FC<ViralityNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onGenerate,
  isGenerating = false,
  isLastStep = false
}) => {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="border-gray-700 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
      )}
      
      {!isLastStep ? (
        <Button 
          type="button" 
          onClick={onNext}
          className={`${currentStep === 1 ? '' : 'ml-auto'} bg-[#9b87f5] hover:bg-[#8B5CF6]`}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          className="ml-auto bg-green-600 hover:bg-green-700"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>Generating Strategy...</>
          ) : (
            <>Generate Virality Strategy <Zap className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default ViralityNavigation;
