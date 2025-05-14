
import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ViralityStrategyForm from '@/components/virality/ViralityStrategyForm';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';

const SocialMediaStrategy: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { isAuthorized, redirectToSignup } = useAuthRedirect(false);
  const { checkPremiumFeature } = usePremiumFeature();

  const handleCreateStrategy = () => {
    if (!isAuthorized) {
      redirectToSignup();
      return;
    }
    
    if (checkPremiumFeature('Virality Strategy')) {
      setShowForm(true);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Boost Your Content Virality</h1>
      <p className="text-gray-400 mb-8">
        Create a comprehensive virality strategy tailored to your brand's unique voice, audience, and goals.
      </p>
      
      {!showForm ? (
        <div className="mb-8">
          <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-4">Create Your Virality Strategy</h2>
            <p className="text-gray-400 mb-6">
              Our AI-powered tool will help you build a comprehensive content strategy 
              to increase engagement, grow your audience, and drive conversions.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#cc0000] flex items-center justify-center mr-3">
                  <span className="text-white font-medium">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Define Your Brand</h3>
                  <p className="text-gray-400 mt-1">
                    Share your business details, tone of voice, and unique selling points.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffcc00] flex items-center justify-center mr-3">
                  <span className="text-gray-900 font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Analyze Your Audience</h3>
                  <p className="text-gray-400 mt-1">
                    Identify your primary and secondary audience demographics, interests, and behaviors.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
                  <span className="text-white font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Build Content Strategy</h3>
                  <p className="text-gray-400 mt-1">
                    Develop content pillars, marketing funnel approach, and engagement tactics.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                className="bg-[#8c52ff] hover:bg-[#7a45e6] px-8"
                onClick={handleCreateStrategy}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Create Virality Strategy 💎
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ViralityStrategyForm />
      )}
    </div>
  );
};

export default SocialMediaStrategy;
