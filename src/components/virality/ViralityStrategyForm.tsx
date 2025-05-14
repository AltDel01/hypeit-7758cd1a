
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useViralityStrategyForm } from '@/hooks/useViralityStrategyForm';
import ViralityProgressBar from './ViralityProgressBar';
import ViralityNavigation from './ViralityNavigation';
import ViralityFormStepRenderer from './ViralityFormStepRenderer';
import ViralityStrategyResult from './ViralityStrategyResult';

const ViralityStrategyForm: React.FC = () => {
  const {
    step,
    totalSteps,
    formData,
    isGenerating,
    strategyGenerated,
    updateBusinessInfo,
    updateToneOfVoice,
    updateAudience,
    updateCompetitors,
    updateContentPillars,
    updateMarketingFunnel,
    updateInfluencerStrategy,
    updateSocialMediaRecommendation,
    updateEngagementStrategy,
    updateSeoStrategy,
    nextStep,
    prevStep,
    generateStrategy
  } = useViralityStrategyForm();

  if (strategyGenerated) {
    return <ViralityStrategyResult strategyData={formData} />;
  }

  return (
    <Card className="bg-gray-900 bg-opacity-60 backdrop-blur-sm text-white border-gray-800">
      <CardContent className="pt-6">
        <ViralityProgressBar currentStep={step} totalSteps={totalSteps} />
        
        <div className="space-y-6">
          <ViralityFormStepRenderer 
            currentStep={step}
            formData={formData}
            updateBusinessInfo={updateBusinessInfo}
            updateToneOfVoice={updateToneOfVoice}
            updateAudience={updateAudience}
            updateCompetitors={updateCompetitors}
            updateContentPillars={updateContentPillars}
            updateMarketingFunnel={updateMarketingFunnel}
            updateInfluencerStrategy={updateInfluencerStrategy}
            updateSocialMediaRecommendation={updateSocialMediaRecommendation}
            updateEngagementStrategy={updateEngagementStrategy}
            updateSeoStrategy={updateSeoStrategy}
          />
          
          <ViralityNavigation 
            currentStep={step}
            totalSteps={totalSteps}
            onPrevious={prevStep}
            onNext={nextStep}
            onGenerate={generateStrategy}
            isGenerating={isGenerating}
            isLastStep={step === totalSteps}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ViralityStrategyForm;
