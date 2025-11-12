
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
