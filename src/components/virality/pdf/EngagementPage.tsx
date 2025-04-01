
import React from 'react';

interface EngagementPageProps {
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
  socialMediaRecommendation: string;
}

const EngagementPage: React.FC<EngagementPageProps> = ({
  engagementStrategy,
  seoStrategy,
  socialMediaRecommendation
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Page header with gradient accent */}
      <div className="h-16 w-full bg-gradient-to-r from-[#8c52ff] to-[#D946EF]"></div>
      
      <div className="p-12 pt-6">
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center text-[#8c52ff]">
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Engagement & SEO Strategy
        </h2>
        
        {/* Social media recommendation section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#D946EF]"></div>
            Social Media Recommendations
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="whitespace-pre-line">{socialMediaRecommendation}</p>
          </div>
        </div>
        
        {/* Engagement strategy section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#8c52ff]"></div>
            Engagement Strategy
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Engaging With Followers</h4>
              <p className="text-sm whitespace-pre-line">{engagementStrategy.engagingWithFollowers}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Community Building</h4>
              <p className="text-sm whitespace-pre-line">{engagementStrategy.communityBuilding}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Engaging Posts</h4>
              <p className="text-sm whitespace-pre-line">{engagementStrategy.engagingPosts}</p>
            </div>
          </div>
        </div>
        
        {/* SEO strategy section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#9b87f5]"></div>
            SEO Strategy
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#9b87f5]">Hashtag Strategy</h4>
              <p className="text-sm whitespace-pre-line">{seoStrategy.hashtagStrategy}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#9b87f5]">Keywords</h4>
              <p className="text-sm whitespace-pre-line">{seoStrategy.keywords}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#9b87f5]">Profile Optimization</h4>
              <p className="text-sm whitespace-pre-line">{seoStrategy.profileOptimization}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#9b87f5]">Social Backlinks</h4>
              <p className="text-sm whitespace-pre-line">{seoStrategy.socialBacklinks}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">This strategy document was created specifically for your brand and business goals.</p>
          <p className="text-gray-500 text-sm">Implement these strategies consistently for best results.</p>
        </div>
      </div>
    </div>
  );
};

export default EngagementPage;
