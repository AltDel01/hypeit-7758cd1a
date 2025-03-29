
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ViralityStrategyData } from '@/hooks/useViralityStrategyForm';

interface Step6MarketingFunnelProps {
  marketingFunnel: ViralityStrategyData['marketingFunnel'];
  influencerStrategy: string;
  updateMarketingFunnel: (funnel: Partial<ViralityStrategyData['marketingFunnel']>) => void;
  updateInfluencerStrategy: (strategy: string) => void;
}

const Step6MarketingFunnel: React.FC<Step6MarketingFunnelProps> = ({
  marketingFunnel,
  influencerStrategy,
  updateMarketingFunnel,
  updateInfluencerStrategy
}) => {
  const handleFunnelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateMarketingFunnel({
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Marketing Funnel & Influencer Strategy</h2>
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Marketing Funnel</h3>
        <p className="text-gray-400 mb-4">
          Define your content strategy for each stage of the marketing funnel.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="awareness" className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2">1</div>
              Awareness
            </Label>
            <Textarea
              id="awareness"
              name="awareness"
              value={marketingFunnel.awareness}
              onChange={handleFunnelChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you attract new audience members to discover your brand?"
            />
          </div>
          
          <div>
            <Label htmlFor="consideration" className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2">2</div>
              Consideration
            </Label>
            <Textarea
              id="consideration"
              name="consideration"
              value={marketingFunnel.consideration}
              onChange={handleFunnelChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you encourage potential customers to evaluate your brand?"
            />
          </div>
          
          <div>
            <Label htmlFor="conversion" className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mr-2">3</div>
              Conversion
            </Label>
            <Textarea
              id="conversion"
              name="conversion"
              value={marketingFunnel.conversion}
              onChange={handleFunnelChange}
              className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
              placeholder="How will you convert interested audience members into customers?"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-white">Influencer Strategy</h3>
        <p className="text-gray-400 mb-4">
          Identify and recommend nano, micro, or mega influencers within your niche to engage with.
        </p>
        
        <div>
          <Label htmlFor="influencerStrategy">KOL/Influencers Strategy</Label>
          <Textarea
            id="influencerStrategy"
            value={influencerStrategy}
            onChange={(e) => updateInfluencerStrategy(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[120px]"
            placeholder="Describe your strategy for working with influencers, including types of influencers, how to contact them, and content brief ideas."
          />
        </div>
      </div>
    </div>
  );
};

export default Step6MarketingFunnel;
