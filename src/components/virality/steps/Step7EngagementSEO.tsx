
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ViralityStrategyData } from '@/hooks/useViralityStrategyForm';

interface Step7EngagementSEOProps {
  socialMediaRecommendation: string;
  engagementStrategy: ViralityStrategyData['engagementStrategy'];
  seoStrategy: ViralityStrategyData['seoStrategy'];
  updateSocialMediaRecommendation: (recommendation: string) => void;
  updateEngagementStrategy: (strategy: Partial<ViralityStrategyData['engagementStrategy']>) => void;
  updateSeoStrategy: (strategy: Partial<ViralityStrategyData['seoStrategy']>) => void;
}

const Step7EngagementSEO: React.FC<Step7EngagementSEOProps> = ({
  socialMediaRecommendation,
  engagementStrategy,
  seoStrategy,
  updateSocialMediaRecommendation,
  updateEngagementStrategy,
  updateSeoStrategy
}) => {
  const handleEngagementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateEngagementStrategy({
      [name]: value
    });
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateSeoStrategy({
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Social Media, Engagement & SEO Strategy</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Social Media Recommendation</h3>
        <Textarea
          id="socialMediaRecommendation"
          value={socialMediaRecommendation}
          onChange={(e) => updateSocialMediaRecommendation(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[100px]"
          placeholder="Describe platform recommendations, posting schedules, and specific strategies for each platform."
        />
      </div>
      
      <div className="space-y-6 mt-8">
        <h3 className="text-lg font-semibold text-white">Engagement Strategy</h3>
        <p className="text-gray-400 mb-4">
          Define how you'll engage with your audience and build a loyal community.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="engagingWithFollowers">Engaging with Followers</Label>
            <Textarea
              id="engagingWithFollowers"
              name="engagingWithFollowers"
              value={engagementStrategy.engagingWithFollowers}
              onChange={handleEngagementChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you engage with your followers? (e.g., responding to comments, DMs, mentions)"
            />
          </div>
          
          <div>
            <Label htmlFor="communityBuilding">Community Building</Label>
            <Textarea
              id="communityBuilding"
              name="communityBuilding"
              value={engagementStrategy.communityBuilding}
              onChange={handleEngagementChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you build a loyal community around your brand?"
            />
          </div>
          
          <div>
            <Label htmlFor="engagingPosts">Engagement Through Posts</Label>
            <Textarea
              id="engagingPosts"
              name="engagingPosts"
              value={engagementStrategy.engagingPosts}
              onChange={handleEngagementChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you make your posts more engaging?"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-6 mt-8">
        <h3 className="text-lg font-semibold text-white">SEO Strategy</h3>
        <p className="text-gray-400 mb-4">
          Optimize your content for search and discovery.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="keywords">Keywords</Label>
            <Textarea
              id="keywords"
              name="keywords"
              value={seoStrategy.keywords}
              onChange={handleSeoChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="List target keywords for your content"
            />
          </div>
          
          <div>
            <Label htmlFor="profileOptimization">Profile Optimization</Label>
            <Textarea
              id="profileOptimization"
              name="profileOptimization"
              value={seoStrategy.profileOptimization}
              onChange={handleSeoChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How to optimize your social media profiles (bios, descriptions, etc.)"
            />
          </div>
          
          <div>
            <Label htmlFor="hashtagStrategy">Hashtag Strategy</Label>
            <Textarea
              id="hashtagStrategy"
              name="hashtagStrategy"
              value={seoStrategy.hashtagStrategy}
              onChange={handleSeoChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="Create reach-enhancing hashtags that match your content pillars and branded hashtags"
            />
          </div>
          
          <div>
            <Label htmlFor="socialBacklinks">Social Backlinks</Label>
            <Textarea
              id="socialBacklinks"
              name="socialBacklinks"
              value={seoStrategy.socialBacklinks}
              onChange={handleSeoChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="Strategies for getting other accounts to link to your accounts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7EngagementSEO;
