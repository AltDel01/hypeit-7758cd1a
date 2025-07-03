import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import CreatorDiscovery from './CreatorDiscovery';
import { 
  BarChart, 
  TrendingUp, 
  PanelLeft,
  LineChart,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Card } from '@/components/ui/card';

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

// Overview Content Component
const OverviewContent = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Analytics Overview</h1>
      <p className="text-gray-400 mb-8">
        Monitor and analyze your performance across all platforms.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Social Media Performance</h2>
          <p className="text-gray-400">
            Track engagement, follower growth, and reach across your social platforms.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" className="opacity-70">
              <BarChart className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </Card>
        
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Content Analytics</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Generated Content</span>
                <span className="text-white">4</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[40%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Brand Assets</span>
                <span className="text-white">2</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full w-[20%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Active Campaigns</span>
                <span className="text-white">1</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
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
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
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
        </Card>
        
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
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
        </Card>
      </div>
    </div>
  );
};

// Content Performance Content Component
const ContentPerformance = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Content Performance</h1>
      <p className="text-gray-400 mb-8">
        Track how your content is performing across different platforms.
      </p>
      
      <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Generated Content Analytics</h2>
        <p className="text-gray-400 mb-6">
          This feature will show performance metrics for all content generated through HYPEIT.
        </p>
        
        <div className="text-center py-8">
          <LineChart className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Connect your social accounts to start tracking content performance.</p>
        </div>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const [activeSection, setActiveSection] = useState('discovery');
  
  const menuItems = [
    { id: 'discovery', label: 'Creator Discovery', icon: Users },
    { id: 'overview', label: 'Influencers Overview', icon: Clock },
    { id: 'social', label: 'Social Media', icon: BarChart },
    { id: 'content', label: 'Content Performance', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'social':
        return <SocialMediaAnalytics />;
      case 'content':
        return <ContentPerformance />;
      case 'discovery':
        return <CreatorDiscovery />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Main content area with sidebar below navbar */}
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
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default AnalyticsPage;
