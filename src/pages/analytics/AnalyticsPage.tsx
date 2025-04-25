
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Instagram, Calendar, BarChart, Users, Mail } from 'lucide-react';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConnectSocialGrid from './ConnectSocialGrid';
import FeatureTabContent from './FeatureTabContent';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

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
    { id: 'influencers', label: 'Influencer Analytics', icon: Users },
    { id: 'outreach', label: 'Influencer Outreach', icon: Mail },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'connect':
        return <ConnectSocialGrid onTrigger={handlePremiumFeature} />;
      default:
        return <FeatureTabContent onTrigger={handlePremiumFeature} />;
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8 flex">
          <SidebarProvider>
            <Sidebar className="h-[calc(100vh-8rem)]">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {menuItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => setActiveSection(item.id)}
                            isActive={activeSection === item.id}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div className="flex-1 pl-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
              {renderContent()}
            </div>
          </SidebarProvider>
        </div>
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
