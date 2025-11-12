
import { ViralityStrategyData } from '@/types/virality';

export const getInitialViralityFormData = (): ViralityStrategyData => ({
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
