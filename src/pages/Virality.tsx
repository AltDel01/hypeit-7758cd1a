
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ViralityStrategyForm from '@/components/virality/ViralityStrategyForm';
import { ArrowUp, ChevronRight, BarChart, TrendingUp, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Create a separate component for the floating toggle button that appears when sidebar is collapsed
const FloatingSidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  
  if (state === "expanded") {
    return null; // Don't show the floating button when sidebar is expanded
  }
  
  return (
    <div className="fixed left-4 top-24 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={toggleSidebar} 
              size="icon" 
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg hover:bg-purple-600/20"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Expand Sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Expand Sidebar
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Social Media Analytics Content Component
const SocialMediaAnalytics = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Social Media Analytics</h1>
      <p className="text-gray-400 mb-8">
        Monitor and analyze your social media performance across platforms.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400">
            Social media analytics features will be available in the next update.
            Connect your social accounts to get insights about your performance.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" disabled className="opacity-70">
              <BarChart className="mr-2 h-4 w-4" />
              Feature Coming Soon
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Key Metrics Preview</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Engagement Rate</span>
                <span className="text-white">--%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Follower Growth</span>
                <span className="text-white">--%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Post Reach</span>
                <span className="text-white">--%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Social Media Strategy Content Component
const SocialMediaStrategy = () => {
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

const Virality = () => {
  // Swap the default active section to keep "Social Media Analytics" first
  const [activeSection, setActiveSection] = useState('analytics');
  const { showPremiumModal, selectedFeature, closePremiumModal } = usePremiumFeature();

  // Update menu items order to swap Analytics and Strategy positions
  const menuItems = [
    { id: 'strategy', label: 'Social Media Strategy', icon: TrendingUp },
    { id: 'analytics', label: 'Social Media Analytics', icon: BarChart },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'analytics':
        return <SocialMediaAnalytics />;
      default:
        return <SocialMediaStrategy />;
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Main content area - Now the sidebar starts below the navbar */}
        <div className="flex flex-1 w-full">
          <SidebarProvider defaultOpen={true}>
            <FloatingSidebarToggle />
            
            <div className="flex">
              <Sidebar variant="sidebar" className="border-r border-slate-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <div className="flex items-center justify-between px-4 py-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarTrigger />
                            </TooltipTrigger>
                            <TooltipContent>
                              Toggle Sidebar
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <SidebarMenu className="space-y-6 p-4">
                        {menuItems.map((item) => (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                              onClick={() => setActiveSection(item.id)}
                              isActive={activeSection === item.id}
                              className="w-full h-14 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-purple-600/20 hover:shadow-lg active:scale-95 px-4"
                              tooltip={item.label}
                            >
                              <item.icon className="w-6 h-6" />
                              <span className="ml-3 font-medium">{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
                
                <SidebarRail />
              </Sidebar>
            </div>
            
            <div className="w-full">
              <main className="flex-1 relative z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                  {renderContent()}
                </div>
                
                {activeSection === 'strategy' && (
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
                    </div>
                  </div>
                )}
              </main>
            </div>
          </SidebarProvider>
        </div>

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
