import React from 'react';
import { Audience, Competitor } from '@/types/virality';

interface AudiencePageProps {
  audience: Audience;
  competitors: Competitor[];
}

const AudiencePage: React.FC<AudiencePageProps> = ({
  audience,
  competitors
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Page header with gradient accent */}
      <div className="h-16 w-full bg-[#9b87f5]"></div>
      
      <div className="p-12 pt-6">
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center text-[#9b87f5]">
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Audience & Competitors
        </h2>
        
        {/* Primary audience section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#8c52ff]"></div>
            Primary Audience
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Demographics</h4>
              <p className="text-sm mb-1"><span className="font-semibold">Age:</span> {audience.primary.demographic.ageRange}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Gender:</span> {audience.primary.demographic.gender}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Location:</span> {audience.primary.demographic.location}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Income:</span> {audience.primary.demographic.income}</p>
              <p className="text-sm"><span className="font-semibold">Education:</span> {audience.primary.demographic.education}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Interests</h4>
              <p className="text-sm mb-1"><span className="font-semibold">Hobbies:</span> {audience.primary.interest.hobbies}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Values:</span> {audience.primary.interest.values}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Lifestyle:</span> {audience.primary.interest.lifestyle}</p>
              <p className="text-sm"><span className="font-semibold">Pain Points:</span> {audience.primary.interest.painPoints}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium mb-2 text-[#8c52ff]">Behavior</h4>
              <p className="text-sm mb-1"><span className="font-semibold">Online Behavior:</span> {audience.primary.behavior.onlineBehavior}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Purchase Behavior:</span> {audience.primary.behavior.purchaseBehavior}</p>
              <p className="text-sm"><span className="font-semibold">Content Preferences:</span> {audience.primary.behavior.contentPreferences}</p>
            </div>
          </div>
        </div>
        
        {/* Secondary audience section (abbreviated) */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#D946EF]"></div>
            Secondary Audience
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-md font-medium mb-2 text-[#D946EF]">Demographics</h4>
                <p className="text-sm mb-1"><span className="font-semibold">Age:</span> {audience.secondary.demographic.ageRange}</p>
                <p className="text-sm"><span className="font-semibold">Gender:</span> {audience.secondary.demographic.gender}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2 text-[#D946EF]">Key Interests</h4>
                <p className="text-sm">{audience.secondary.interest.hobbies}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2 text-[#D946EF]">Key Behaviors</h4>
                <p className="text-sm">{audience.secondary.behavior.onlineBehavior}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Competitors section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#9b87f5]"></div>
            Top Competitors
          </h3>
          
          <div className="space-y-4">
            {competitors.slice(0, 2).map((competitor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium mb-2">{competitor.name}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm mb-1"><span className="font-semibold">Followers:</span> {competitor.socialFollowers}</p>
                    <p className="text-sm mb-1"><span className="font-semibold">Post Frequency:</span> {competitor.postFrequency}</p>
                    <p className="text-sm"><span className="font-semibold">Content Themes:</span> {competitor.contentThemes}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm"><span className="font-semibold">Strengths:</span> {competitor.strengths}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm"><span className="font-semibold">Weaknesses:</span> {competitor.weaknesses}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudiencePage;
