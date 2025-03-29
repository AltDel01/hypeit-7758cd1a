
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useViralityStrategyForm, ViralityStrategyData } from '@/hooks/useViralityStrategyForm';
import ViralityProgressBar from './ViralityProgressBar';
import ViralityNavigation from './ViralityNavigation';
import Step1BusinessInfo from './steps/Step1BusinessInfo';
import Step2ToneOfVoice from './steps/Step2ToneOfVoice';
import Step3Audience from './steps/Step3Audience';
import Step4Competitors from './steps/Step4Competitors';
import Step5ContentPillars from './steps/Step5ContentPillars';
import Step6MarketingFunnel from './steps/Step6MarketingFunnel';
import Step7EngagementSEO from './steps/Step7EngagementSEO';
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

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BusinessInfo
            businessInfo={formData.businessInfo}
            updateBusinessInfo={updateBusinessInfo}
          />
        );
      case 2:
        return (
          <Step2ToneOfVoice
            toneOfVoice={formData.toneOfVoice}
            updateToneOfVoice={updateToneOfVoice}
          />
        );
      case 3:
        return (
          <Step3Audience
            audience={formData.audience}
            updateAudience={updateAudience}
          />
        );
      case 4:
        return (
          <Step4Competitors
            competitors={formData.competitors}
            updateCompetitors={updateCompetitors}
          />
        );
      case 5:
        return (
          <Step5ContentPillars
            contentPillars={formData.contentPillars}
            updateContentPillars={updateContentPillars}
          />
        );
      case 6:
        return (
          <Step6MarketingFunnel
            marketingFunnel={formData.marketingFunnel}
            influencerStrategy={formData.influencerStrategy}
            updateMarketingFunnel={updateMarketingFunnel}
            updateInfluencerStrategy={updateInfluencerStrategy}
          />
        );
      case 7:
        return (
          <Step7EngagementSEO
            socialMediaRecommendation={formData.socialMediaRecommendation}
            engagementStrategy={formData.engagementStrategy}
            seoStrategy={formData.seoStrategy}
            updateSocialMediaRecommendation={updateSocialMediaRecommendation}
            updateEngagementStrategy={updateEngagementStrategy}
            updateSeoStrategy={updateSeoStrategy}
          />
        );
      default:
        return null;
    }
  };

  if (strategyGenerated) {
    return <ViralityStrategyResult strategyData={formData} />;
  }

  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardContent className="pt-6">
        <ViralityProgressBar currentStep={step} totalSteps={totalSteps} />
        
        <div className="space-y-6">
          {renderCurrentStep()}
          
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
