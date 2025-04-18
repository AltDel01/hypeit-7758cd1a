
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';

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
  const { checkPremiumFeature, showPremiumModal, closePremiumModal } = usePremiumFeature();

  const handleNext = () => {
    if (!isAuthorized) {
      redirectToSignup();
      return;
    }

    if (step === 3) {
      if (checkPremiumFeature('Brand Identity Package')) {
        onNext();
      }
      return;
    }

    onNext();
  };
  
  return (
    <>
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
              <>Create Full Brand Identity 💎</>
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
            Generate Brand Identity 💎
          </Button>
        )}
      </div>

      <PremiumFeatureModal 
        isOpen={showPremiumModal} 
        onClose={closePremiumModal}
        feature="Brand Identity Package"
      />
    </>
  );
};

export default FormNavigation;
