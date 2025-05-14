
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail
} from "@/components/ui/sidebar";
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import ViralitySidebarToggle from './components/ViralitySidebarToggle';
import SocialMediaAnalytics from '@/components/virality/sections/SocialMediaAnalytics';
import SocialMediaStrategy from '@/components/virality/sections/SocialMediaStrategy';
import CampaignAnalytics from '@/components/virality/sections/CampaignAnalytics';
import TrendingTopicsSidebar from '@/components/virality/TrendingTopicsSidebar';
import { ArrowLeft, BarChart, TrendingUp, BarChart2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { analyticsService } from '@/services/requests';

const ViralityDashboard = () => {
  const [activeSection, setActiveSection] = useState('analytics');
  const { showPremiumModal, selectedFeature, closePremiumModal } = usePremiumFeature();

  const menuItems = [
    { id: 'analytics', label: 'Social Media Analytics', icon: BarChart },
    { id: 'strategy', label: 'Social Media Strategy', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaign Analytics', icon: BarChart2 }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'analytics':
        return <SocialMediaAnalytics />;
      case 'campaigns':
        return <CampaignAnalytics />;
      default:
        return <SocialMediaStrategy />;
    }
  };

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    
    // Track the section change using analytics service
    if (id === 'strategy') {
      analyticsService.trackStrategyGeneration('virality');
    }
    
    toast({
      title: "Section Changed",
      description: `Viewing ${id} section`,
    });
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 w-full">
          <SidebarProvider defaultOpen={true}>
            <ViralitySidebarToggle />
            
            <div className="flex">
              <Sidebar variant="sidebar" className="border-r border-slate-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <div className="p-4">
                        <div className="flex items-center mb-6">
                          <Link to="/" className="mr-2 text-gray-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                          </Link>
                          <Link to="/" className="flex items-center">
                            <img 
                              src="/lovable-uploads/04ce31a6-f289-4db5-8b56-7c67d26d6113.png" 
                              alt="HYPEIT Logo" 
                              className="h-9 w-auto"
                            />
                          </Link>
                        </div>
                      </div>
                      <SidebarMenu className="space-y-2 p-2">
                        {menuItems.map((item) => (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                              onClick={() => handleMenuClick(item.id)}
                              isActive={activeSection === item.id}
                              className="w-full h-12 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-purple-600/20 hover:shadow-lg active:scale-95 px-4"
                              tooltip={item.label}
                            >
                              <item.icon className="w-5 h-5" />
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
                
                {activeSection === 'strategy' && <TrendingTopicsSidebar />}
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

export default ViralityDashboard;
