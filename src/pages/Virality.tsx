import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { SidebarProvider } from "@/components/ui/sidebar";
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import FloatingSidebarToggle from '@/components/virality/FloatingSidebarToggle';
import ViralitySidebar from '@/components/virality/ViralitySidebar';
import SocialMediaAnalytics from '@/components/virality/sections/SocialMediaAnalytics';
import SocialMediaStrategy from '@/components/virality/sections/SocialMediaStrategy';
import TrendingTopicsSidebar from '@/components/virality/TrendingTopicsSidebar';

const Virality = () => {
  // Swap the default active section to keep "Social Media Analytics" first
  const [activeSection, setActiveSection] = useState('analytics');
  const { showPremiumModal, selectedFeature, closePremiumModal } = usePremiumFeature();

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
        
        {/* Main content area - The sidebar starts below the navbar */}
        <div className="flex flex-1 w-full">
          <SidebarProvider defaultOpen={true}>
            <FloatingSidebarToggle />
            
            <ViralitySidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />
            
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

export default Virality;
