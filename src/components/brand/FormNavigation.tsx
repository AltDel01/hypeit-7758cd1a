
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileDown } from 'lucide-react';

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitStep: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  step,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitStep
}) => {
  return (
    <div className="flex justify-between mt-8">
      {step > 1 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="border-gray-700 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
      )}
      
      {step < totalSteps ? (
        <Button 
          type="button" 
          onClick={onNext}
          className="ml-auto bg-blue-600 hover:bg-blue-700"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          className="ml-auto bg-green-600 hover:bg-green-700"
          onClick={onSubmit}
        >
          Generate Brand Identity <FileDown className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
