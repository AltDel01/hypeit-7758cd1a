
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuroraBackground from '@/components/effects/AuroraBackground';
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
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, BarChart, LineChart, PieChart } from 'lucide-react';

// Analytics Content Components
import OverviewContent from './sections/OverviewContent';
import SocialMediaAnalytics from './sections/SocialMediaAnalytics';
import ContentPerformance from './sections/ContentPerformance';
import AnalyticsSidebarToggle from './components/AnalyticsSidebarToggle';

const AnalyticsDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  const menuItems = [
    { id: 'overview', label: 'Analytics Overview', icon: PieChart },
    { id: 'social', label: 'Social Media', icon: BarChart },
    { id: 'content', label: 'Content Performance', icon: LineChart },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'social':
        return <SocialMediaAnalytics />;
      case 'content':
        return <ContentPerformance />;
      default:
        return <OverviewContent />;
    }
  };

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    toast({
      title: "Section Changed",
      description: `Viewing ${id} analytics`,
    });
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 w-full">
          <SidebarProvider defaultOpen={true}>
            <AnalyticsSidebarToggle />
            
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
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default AnalyticsDashboard;
