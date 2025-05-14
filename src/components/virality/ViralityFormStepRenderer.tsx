
import React from 'react';
import { ViralityStrategyData } from '@/hooks/useViralityStrategyForm';
import Step1BusinessInfo from './steps/Step1BusinessInfo';
import Step2ToneOfVoice from './steps/Step2ToneOfVoice';
import Step3Audience from './steps/Step3Audience';
import Step4Competitors from './steps/Step4Competitors';
import Step5ContentPillars from './steps/Step5ContentPillars';
import Step6MarketingFunnel from './steps/Step6MarketingFunnel';
import Step7EngagementSEO from './steps/Step7EngagementSEO';

interface ViralityFormStepRendererProps {
  currentStep: number;
  formData: ViralityStrategyData;
  updateBusinessInfo: (info: Partial<ViralityStrategyData['businessInfo']>) => void;
  updateToneOfVoice: (tone: Partial<ViralityStrategyData['toneOfVoice']>) => void;
  updateAudience: (audience: Partial<ViralityStrategyData['audience']>) => void;
  updateCompetitors: (competitors: ViralityStrategyData['competitors']) => void;
  updateContentPillars: (pillars: ViralityStrategyData['contentPillars']) => void;
  updateMarketingFunnel: (funnel: Partial<ViralityStrategyData['marketingFunnel']>) => void;
  updateInfluencerStrategy: (strategy: string) => void;
  updateSocialMediaRecommendation: (recommendation: string) => void;
  updateEngagementStrategy: (strategy: Partial<ViralityStrategyData['engagementStrategy']>) => void;
  updateSeoStrategy: (strategy: Partial<ViralityStrategyData['seoStrategy']>) => void;
}

const ViralityFormStepRenderer: React.FC<ViralityFormStepRendererProps> = ({
  currentStep,
  formData,
  updateBusinessInfo,
  updateToneOfVoice,
  updateAudience,
  updateCompetitors,
  updateContentPillars,
  updateMarketingFunnel,
  updateInfluencerStrategy,
  updateSocialMediaRecommendation,
  updateEngagementStrategy,
  updateSeoStrategy
}) => {
  switch (currentStep) {
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

export default ViralityFormStepRenderer;
