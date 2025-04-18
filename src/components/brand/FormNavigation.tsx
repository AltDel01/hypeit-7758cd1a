import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Diamond } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

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
  const { isAuthorized, redirectToSignup } = useAuthRedirect(false);

  const handleNext = () => {
    if (!isAuthorized) {
      redirectToSignup();
      return;
    }
    onNext();
  };
  
  const handleSubmit = () => {
    if (!isAuthorized) {
      redirectToSignup();
      return;
    }
    if (onSubmit) {
      onSubmit();
    }
  };

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
          onClick={handleNext}
          className="ml-auto bg-[#8c52ff] hover:bg-[#7a45e6]"
        >
          {step === 3 ? (
            <>
              Create Full Brand Identity 
              <Diamond 
                className="ml-2 h-4 w-4" 
                fill="#00A3FF" 
                stroke="white" 
                strokeWidth={1.5} 
              />
            </>
          ) : (
            'Next'
          )}
        </Button>
      ) : (
        <Button 
          type="button" 
          className="ml-auto bg-[#8c52ff] hover:bg-[#7a45e6] px-6"
          onClick={handleSubmit}
        >
          Create Full Brand Identity <Diamond className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
