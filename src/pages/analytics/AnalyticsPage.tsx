
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Instagram, Calendar, BarChart, Users, Mail, Image } from 'lucide-react';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConnectSocialGrid from './ConnectSocialGrid';
import FeatureTabContent from './FeatureTabContent';
import GeneratedContent from './GeneratedContent';
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
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [activePremiumFeature, setActivePremiumFeature] = useState('');
  const [activeSection, setActiveSection] = useState('connect');
  const navigate = useNavigate();

  const handlePremiumFeature = (feature: string) => {
    if (!user) {
      localStorage.setItem('authRedirectPath', '/analytics');
      navigate('/login');
      return;
    }
    setActivePremiumFeature(feature);
    setIsPremiumModalOpen(true);
  };

  const menuItems = [
    { id: 'connect', label: 'Connect Accounts', icon: Instagram },
    { id: 'schedule', label: 'Schedule Posts', icon: Calendar },
    { id: 'content', label: 'Content Analysis', icon: BarChart },
    { id: 'generated', label: 'Generated Content', icon: Image },
    { id: 'influencers', label: 'Influencer Analytics', icon: Users },
    { id: 'outreach', label: 'Influencer Outreach', icon: Mail },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'connect':
        return <ConnectSocialGrid onTrigger={handlePremiumFeature} />;
      case 'generated':
        return <GeneratedContent />;
      default:
        return <FeatureTabContent onTrigger={handlePremiumFeature} />;
    }
  };

  return (
    <AuroraBackground>
      <Navbar />
      <div className="flex min-h-screen w-full">
        <SidebarProvider defaultOpen={true}>
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
          </Sidebar>
          <div className="flex-1 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
            {renderContent()}
          </div>
        </SidebarProvider>
      </div>
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        feature={activePremiumFeature}
      />
    </AuroraBackground>
  );
};

export default AnalyticsPage;
