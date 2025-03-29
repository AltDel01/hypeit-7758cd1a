
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { ViralityStrategyData } from '@/hooks/useViralityStrategyForm';

interface ViralityStrategyResultProps {
  strategyData: ViralityStrategyData;
}

const ViralityStrategyResult: React.FC<ViralityStrategyResultProps> = ({
  strategyData
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Virality Strategy</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 text-white">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
      
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Business Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Business Details</h4>
                  <p className="text-gray-300 mb-1"><span className="font-semibold">Name:</span> {strategyData.businessInfo.businessName}</p>
                  <p className="text-gray-300 mb-1"><span className="font-semibold">Tagline:</span> {strategyData.businessInfo.tagline}</p>
                  <p className="text-gray-300 mb-1"><span className="font-semibold">Slogan:</span> {strategyData.businessInfo.brandSlogan}</p>
                </div>
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Unique Selling Point</h4>
                  <p className="text-gray-300">{strategyData.businessInfo.uniqueSellingPoint}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Audience Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Primary Audience</h4>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold">Demographics:</span> {strategyData.audience.primary.demographic.ageRange} years, 
                    {strategyData.audience.primary.demographic.gender}, 
                    {strategyData.audience.primary.demographic.location}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold">Interests:</span> {strategyData.audience.primary.interest.hobbies}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Behavior:</span> {strategyData.audience.primary.behavior.onlineBehavior}
                  </p>
                </div>
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Tone of Voice</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Casual</span>
                        <span className="text-gray-400">Formal</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${strategyData.toneOfVoice.casualFormal}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Playful</span>
                        <span className="text-gray-400">Serious</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${strategyData.toneOfVoice.playfulSerious}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Content Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategyData.contentPillars.map((pillar, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">{pillar.name || `Content Pillar ${index + 1}`}</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {pillar.contentIdeas.map((idea, ideaIndex) => (
                        <li key={ideaIndex}>{idea || 'TBD'}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Marketing Funnel</h3>
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Awareness</h4>
                  <p className="text-gray-300">{strategyData.marketingFunnel.awareness}</p>
                </div>
                <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">Consideration</h4>
                  <p className="text-gray-300">{strategyData.marketingFunnel.consideration}</p>
                </div>
                <div className="bg-green-900 bg-opacity-30 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Conversion</h4>
                  <p className="text-gray-300">{strategyData.marketingFunnel.conversion}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Engagement & SEO Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Engagement Approach</h4>
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold">Community Building:</span> {strategyData.engagementStrategy.communityBuilding}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Post Engagement:</span> {strategyData.engagementStrategy.engagingPosts}
                  </p>
                </div>
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">SEO Optimization</h4>
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold">Hashtag Strategy:</span> {strategyData.seoStrategy.hashtagStrategy}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Key Keywords:</span> {strategyData.seoStrategy.keywords}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Influencer Strategy</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300">{strategyData.influencerStrategy}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViralityStrategyResult;
