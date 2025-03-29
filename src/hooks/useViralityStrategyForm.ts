
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export type BusinessInfo = {
  businessName: string;
  tagline: string;
  summary: string;
  keyValues: string;
  brandStory: string;
  businessGoals: string;
  brandSlogan: string;
  uniqueSellingPoint: string;
};

export type ToneOfVoice = {
  casualFormal: number;
  playfulSerious: number;
  energeticRelaxed: number;
  modernTraditional: number;
};

export type Demographic = {
  ageRange: string;
  gender: string;
  location: string;
  income: string;
  education: string;
  status: string;
};

export type Interest = {
  hobbies: string;
  values: string;
  lifestyle: string;
  painPoints: string;
};

export type Behavior = {
  onlineBehavior: string;
  purchaseBehavior: string;
  contentPreferences: string;
};

export type Audience = {
  primary: {
    demographic: Demographic;
    interest: Interest;
    behavior: Behavior;
  };
  secondary: {
    demographic: Demographic;
    interest: Interest;
    behavior: Behavior;
  };
};

export type Competitor = {
  name: string;
  socialFollowers: string;
  postFrequency: string;
  contentThemes: string;
  contentTypes: string;
  visualStyle: string;
  interaction: string;
  communityBuilding: string;
  feedback: string;
  strengths: string;
  weaknesses: string;
};

export type ContentPillar = {
  name: string;
  contentIdeas: string[];
};

export type ViralityStrategyData = {
  businessInfo: BusinessInfo;
  toneOfVoice: ToneOfVoice;
  audience: Audience;
  competitors: Competitor[];
  contentPillars: ContentPillar[];
  influencerStrategy: string;
  marketingFunnel: {
    awareness: string;
    consideration: string;
    conversion: string;
  };
  socialMediaRecommendation: string;
  engagementStrategy: {
    engagingWithFollowers: string;
    communityBuilding: string;
    engagingPosts: string;
  };
  seoStrategy: {
    keywords: string;
    profileOptimization: string;
    hashtagStrategy: string;
    socialBacklinks: string;
  };
};

export function useViralityStrategyForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ViralityStrategyData>({
    businessInfo: {
      businessName: '',
      tagline: '',
      summary: '',
      keyValues: '',
      brandStory: '',
      businessGoals: '',
      brandSlogan: '',
      uniqueSellingPoint: '',
    },
    toneOfVoice: {
      casualFormal: 50,
      playfulSerious: 50,
      energeticRelaxed: 50,
      modernTraditional: 50,
    },
    audience: {
      primary: {
        demographic: {
          ageRange: '',
          gender: '',
          location: '',
          income: '',
          education: '',
          status: '',
        },
        interest: {
          hobbies: '',
          values: '',
          lifestyle: '',
          painPoints: '',
        },
        behavior: {
          onlineBehavior: '',
          purchaseBehavior: '',
          contentPreferences: '',
        },
      },
      secondary: {
        demographic: {
          ageRange: '',
          gender: '',
          location: '',
          income: '',
          education: '',
          status: '',
        },
        interest: {
          hobbies: '',
          values: '',
          lifestyle: '',
          painPoints: '',
        },
        behavior: {
          onlineBehavior: '',
          purchaseBehavior: '',
          contentPreferences: '',
        },
      },
    },
    competitors: [{
      name: '',
      socialFollowers: '',
      postFrequency: '',
      contentThemes: '',
      contentTypes: '',
      visualStyle: '',
      interaction: '',
      communityBuilding: '',
      feedback: '',
      strengths: '',
      weaknesses: '',
    }],
    contentPillars: [
      { name: '', contentIdeas: ['', '', ''] },
      { name: '', contentIdeas: ['', '', ''] },
      { name: '', contentIdeas: ['', '', ''] },
    ],
    influencerStrategy: '',
    marketingFunnel: {
      awareness: '',
      consideration: '',
      conversion: '',
    },
    socialMediaRecommendation: '',
    engagementStrategy: {
      engagingWithFollowers: '',
      communityBuilding: '',
      engagingPosts: '',
    },
    seoStrategy: {
      keywords: '',
      profileOptimization: '',
      hashtagStrategy: '',
      socialBacklinks: '',
    },
  });
  
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
