
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConnectSocialGrid from './ConnectSocialGrid';
import FeatureTabContent from './FeatureTabContent';
import AnalyticsSidebar from './AnalyticsSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const TAB_CONTENT = {
  connect: (onTrigger: (feature: string) => void) => (
    <ConnectSocialGrid onTrigger={onTrigger} />
  ),
  schedule: (onTrigger: (feature: string) => void) => (
    <FeatureTabContent onTrigger={onTrigger} tab="schedule" />
  ),
  content: (onTrigger: (feature: string) => void) => (
    <FeatureTabContent onTrigger={onTrigger} tab="content" />
  ),
  influencers: (onTrigger: (feature: string) => void) => (
    <FeatureTabContent onTrigger={onTrigger} tab="influencers" />
  ),
  outreach: (onTrigger: (feature: string) => void) => (
    <FeatureTabContent onTrigger={onTrigger} tab="outreach" />
  ),
};

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [activePremiumFeature, setActivePremiumFeature] = useState('');
  const [activeTab, setActiveTab] = useState('connect');
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
        <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 py-8 flex flex-row gap-4 items-stretch relative">
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AnalyticsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              <section className="flex-1 ml-0 min-h-[400px] w-full rounded-xl p-0 relative">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
                <div className="w-full">
                  {TAB_CONTENT[activeTab]
                    ? TAB_CONTENT[activeTab](handlePremiumFeature)
                    : null}
                </div>
              </section>
            </div>
          </SidebarProvider>
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
