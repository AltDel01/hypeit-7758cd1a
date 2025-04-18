import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ViralityStrategyForm from '@/components/virality/ViralityStrategyForm';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';

const Virality = () => {
  const [showForm, setShowForm] = useState(false);
  const { isAuthorized, redirectToSignup } = useAuthRedirect(false);
  const { showPremiumModal, selectedFeature, checkPremiumFeature, closePremiumModal } = usePremiumFeature();

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
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0 relative z-10">
          {/* Main content area - 3/5 width */}
          <div className="col-span-3 p-8">
            <div className="max-w-3xl mx-auto">
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
          </div>
          
          {/* Virality examples - 2/5 width */}
          <div className="col-span-2 p-6 bg-transparent overflow-y-auto max-h-screen">
            <div className="space-y-5">
              <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
                <h3 className="text-white font-medium mb-3">Trending Topics</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span>#SustainableFashion</span>
                    <span className="text-green-400">+128%</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span>#WellnessWednesday</span>
                    <span className="text-green-400">+95%</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span>#ProductivityHacks</span>
                    <span className="text-green-400">+82%</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span>#RemoteWork</span>
                    <span className="text-green-400">+67%</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
                <h3 className="text-white font-medium mb-3">Content Pillar Example</h3>
                <div className="bg-gray-800 rounded-md p-3 mb-3">
                  <h4 className="text-[#8c52ff] text-sm font-medium mb-2">Educational Content</h4>
                  <ul className="pl-5 text-gray-300 text-sm space-y-1 list-disc">
                    <li>Industry insights and trends</li>
                    <li>How-to guides and tutorials</li>
                    <li>Expert interviews and tips</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button variant="link" size="sm" className="text-[#8c52ff] p-0">
                    See more examples <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
                <h3 className="text-white font-medium mb-3">Virality Case Study</h3>
                <img 
                  src="https://images.unsplash.com/photo-1611162616475-46592b321512?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                  alt="Viral campaign example" 
                  className="w-full rounded-md mb-3" 
                />
                <p className="text-gray-400 text-sm">
                  A successful campaign that generated 2.5M views and 150K shares by leveraging
                  user-generated content and a branded hashtag challenge.
                </p>
              </div>
              
              <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
                <h3 className="text-white font-medium mb-3">Performance Metrics</h3>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Engagement Rate</span>
                      <span className="text-white">8.5%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-[#8c52ff] rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Share Rate</span>
                      <span className="text-white">12.3%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-[#8c52ff] rounded-full" style={{ width: '63%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Conversion Rate</span>
                      <span className="text-white">3.7%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '37%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <PremiumFeatureModal 
          isOpen={showPremiumModal}
          onClose={closePremiumModal}
          feature={selectedFeature}
        />
      </div>
    </AuroraBackground>
  );
};

export default Virality;
