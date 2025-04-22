
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Instagram, Linkedin, Calendar, BarChart, Users, Mail } from 'lucide-react';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConnectSocialGrid from './ConnectSocialGrid';
import FeatureTabContent from './FeatureTabContent';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [activePremiumFeature, setActivePremiumFeature] = useState('');
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

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
          <Tabs defaultValue="connect" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="bg-gray-800 p-1 mb-6 flex flex-nowrap">
                <TabsTrigger value="connect" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4" />
                    <span className="hidden md:inline">Connect Accounts</span>
                    <span className="md:hidden">Connect</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">Schedule Posts</span>
                    <span className="md:hidden">Schedule</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden md:inline">Content Analysis</span>
                    <span className="md:hidden">Analysis</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="influencers" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Influencer Analytics</span>
                    <span className="md:hidden">Influencers</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="outreach" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden md:inline">Influencer Outreach</span>
                    <span className="md:hidden">Outreach</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="connect" className="mt-4">
              <ConnectSocialGrid onTrigger={handlePremiumFeature} />
            </TabsContent>
            <FeatureTabContent onTrigger={handlePremiumFeature} />
          </Tabs>
        </main>
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
