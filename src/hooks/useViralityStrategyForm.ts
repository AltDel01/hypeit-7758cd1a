
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  ViralityStrategyData, 
  BusinessInfo, 
  ToneOfVoice, 
  Audience, 
  Competitor, 
  ContentPillar 
} from '@/types/virality';
import { getInitialViralityFormData } from '@/utils/virality/initialData';
import { viralityService } from '@/services/virality/viralityService';

// Use proper export type syntax for re-exports
export type { 
  BusinessInfo, 
  ToneOfVoice, 
  Demographic, 
  Interest, 
  Behavior, 
  Audience, 
  Competitor, 
  ContentPillar, 
  ViralityStrategyData 
} from '@/types/virality';

export function useViralityStrategyForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ViralityStrategyData>(getInitialViralityFormData());
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyGenerated, setStrategyGenerated] = useState(false);
  const { toast } = useToast();
  const totalSteps = 7;

  const updateBusinessInfo = (info: Partial<BusinessInfo>) => {
    setFormData(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, ...info }
    }));
  };

  const updateToneOfVoice = (tone: Partial<ToneOfVoice>) => {
    setFormData(prev => ({
      ...prev,
      toneOfVoice: { ...prev.toneOfVoice, ...tone }
    }));
  };

  const updateAudience = (audienceData: Partial<Audience>) => {
    setFormData(prev => ({
      ...prev,
      audience: { ...prev.audience, ...audienceData }
    }));
  };

  const updateCompetitors = (competitors: Competitor[]) => {
    setFormData(prev => ({
      ...prev,
      competitors
    }));
  };

  const updateContentPillars = (contentPillars: ContentPillar[]) => {
    setFormData(prev => ({
      ...prev,
      contentPillars
    }));
  };

  const updateMarketingFunnel = (funnel: Partial<ViralityStrategyData['marketingFunnel']>) => {
    setFormData(prev => ({
      ...prev,
      marketingFunnel: { ...prev.marketingFunnel, ...funnel }
    }));
  };

  const updateInfluencerStrategy = (strategy: string) => {
    setFormData(prev => ({
      ...prev,
      influencerStrategy: strategy
    }));
  };

  const updateSocialMediaRecommendation = (recommendation: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaRecommendation: recommendation
    }));
  };

  const updateEngagementStrategy = (strategy: Partial<ViralityStrategyData['engagementStrategy']>) => {
    setFormData(prev => ({
      ...prev,
      engagementStrategy: { ...prev.engagementStrategy, ...strategy }
    }));
  };

  const updateSeoStrategy = (strategy: Partial<ViralityStrategyData['seoStrategy']>) => {
    setFormData(prev => ({
      ...prev,
      seoStrategy: { ...prev.seoStrategy, ...strategy }
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const generateStrategy = () => {
    setIsGenerating(true);
    
    // Track strategy generation
    if (formData.businessInfo.businessName) {
      viralityService.trackStrategyGeneration(formData.businessInfo.businessName);
    }
    
    // Simulate strategy generation with a timeout
    setTimeout(() => {
      setIsGenerating(false);
      setStrategyGenerated(true);
      
      toast({
        title: "Virality Strategy Generated!",
        description: "Your custom strategy is ready to be explored.",
        variant: "default",
      });
    }, 2000);
  };

  return {
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
  };
}
