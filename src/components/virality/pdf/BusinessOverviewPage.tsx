
import React from 'react';
import { BusinessInfo, ToneOfVoice } from '@/hooks/useViralityStrategyForm';

interface BusinessOverviewPageProps {
  businessInfo: BusinessInfo;
  toneOfVoice: ToneOfVoice;
}

const BusinessOverviewPage: React.FC<BusinessOverviewPageProps> = ({
  businessInfo,
  toneOfVoice
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Page header with gradient accent */}
      <div className="h-16 w-full bg-[#8c52ff]"></div>
      
      <div className="p-12 pt-6">
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center text-[#8c52ff]">
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Business Overview
        </h2>
        
        {/* Business details section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#8c52ff]"></div>
            Business Details
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h4 className="text-lg font-medium mb-3">Identity</h4>
              <p className="mb-2"><span className="font-semibold">Business Name:</span> {businessInfo.businessName}</p>
              <p className="mb-2"><span className="font-semibold">Tagline:</span> {businessInfo.tagline}</p>
              <p className="mb-2"><span className="font-semibold">Slogan:</span> {businessInfo.brandSlogan}</p>
              <p><span className="font-semibold">USP:</span> {businessInfo.uniqueSellingPoint}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h4 className="text-lg font-medium mb-3">Core Values</h4>
              <p className="whitespace-pre-line">{businessInfo.keyValues}</p>
            </div>
          </div>
        </div>
        
        {/* Brand story section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#D946EF]"></div>
            Brand Story
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="whitespace-pre-line">{businessInfo.brandStory}</p>
          </div>
        </div>
        
        {/* Tone of voice section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm bg-[#9b87f5]"></div>
            Tone of Voice
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Casual</span>
                  <span className="text-gray-600">Formal</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#8c52ff] rounded-full" 
                    style={{ width: `${toneOfVoice.casualFormal}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Playful</span>
                  <span className="text-gray-600">Serious</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#8c52ff] rounded-full" 
                    style={{ width: `${toneOfVoice.playfulSerious}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Energetic</span>
                  <span className="text-gray-600">Relaxed</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#D946EF] rounded-full" 
                    style={{ width: `${toneOfVoice.energeticRelaxed}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Modern</span>
                  <span className="text-gray-600">Traditional</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#D946EF] rounded-full" 
                    style={{ width: `${toneOfVoice.modernTraditional}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverviewPage;
