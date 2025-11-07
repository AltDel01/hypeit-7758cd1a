
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '@/components/effects/AuroraBackground';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ContentPlanner from '@/components/dashboard/sections/ContentPlanner';
import AIContentGenerator from '@/components/dashboard/sections/AIContentGenerator';
import AnalyticsInsights from '@/components/dashboard/sections/AnalyticsInsights';
import AIHostLiveStream from '@/components/dashboard/sections/AIHostLiveStream';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('planner');
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/signup');
    }
  }, [user, navigate]);

  const renderContent = () => {
    switch (activeSection) {
      case 'planner':
        return <ContentPlanner />;
      case 'generator':
        return <AIContentGenerator />;
      case 'analytics':
        return <AnalyticsInsights />;
      case 'livestream':
        return <AIHostLiveStream />;
      default:
        return <ContentPlanner />;
    }
  };

  if (!user) return null;

  return (
    <AuroraBackground>
      <div className="flex min-h-screen w-full">
        <SidebarProvider defaultOpen={!isMobile}>
          <DashboardSidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
              {renderContent()}
            </div>
          </main>
        </SidebarProvider>
      </div>
    </AuroraBackground>
  );
};

export default Dashboard;
