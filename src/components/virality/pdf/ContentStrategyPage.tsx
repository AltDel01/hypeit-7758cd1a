
import React from 'react';
import { ContentPillar } from '@/hooks/useViralityStrategyForm';

interface ContentStrategyPageProps {
  contentPillars: ContentPillar[];
  marketingFunnel: {
    awareness: string;
    consideration: string;
    conversion: string;
  };
  influencerStrategy: string;
}

const ContentStrategyPage: React.FC<ContentStrategyPageProps> = ({
  contentPillars,
  marketingFunnel,
  influencerStrategy
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Page header with gradient accent */}
      <div className="h-16 w-full bg-[#D946EF]"></div>
      
      <div className="p-12 pt-6">
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center text-[#D946EF]">
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Content Strategy
        </h2>
        
        {/* Content pillars section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#8c52ff]"></div>
            Content Pillars
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            {contentPillars.map((pillar, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium mb-3">{pillar.name || `Content Pillar ${index + 1}`}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {pillar.contentIdeas.map((idea, ideaIndex) => (
                    <li key={ideaIndex} className="text-sm">{idea || 'TBD'}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Marketing funnel section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#D946EF]"></div>
            Marketing Funnel
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm border-t-2 border-blue-400">
              <h4 className="text-lg font-medium mb-2 text-blue-600">Awareness</h4>
              <p className="text-sm whitespace-pre-line">{marketingFunnel.awareness}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg shadow-sm border-t-2 border-purple-400">
              <h4 className="text-lg font-medium mb-2 text-purple-600">Consideration</h4>
              <p className="text-sm whitespace-pre-line">{marketingFunnel.consideration}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg shadow-sm border-t-2 border-green-400">
              <h4 className="text-lg font-medium mb-2 text-green-600">Conversion</h4>
              <p className="text-sm whitespace-pre-line">{marketingFunnel.conversion}</p>
            </div>
          </div>
        </div>
        
        {/* Influencer strategy section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#9b87f5]"></div>
            Influencer Strategy
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#9b87f5] flex items-center justify-center text-white mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm whitespace-pre-line">{influencerStrategy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStrategyPage;
