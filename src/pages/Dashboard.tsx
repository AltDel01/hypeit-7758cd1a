import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Wand2, BarChart3, Video, Palette, Clapperboard, ChevronDown, ArrowLeft } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ContentPlanner from '@/components/dashboard/sections/ContentPlanner';
import AIContentGenerator from '@/components/dashboard/sections/AIContentGenerator';
import AIVideoEditor from '@/components/dashboard/sections/AIVideoEditor';
import AnalyticsInsights from '@/components/dashboard/sections/AnalyticsInsights';
import AIHostLiveStream from '@/components/dashboard/sections/AIHostLiveStream';
import GenerateBrandIdentity from '@/components/dashboard/sections/GenerateBrandIdentity';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const menuItems = [
  { id: 'planner', label: 'Content Planner', icon: Calendar },
  { id: 'generator', label: 'AI Content Generator', icon: Wand2 },
  { id: 'videoeditor', label: 'AI Video Editor', icon: Clapperboard },
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
  { id: 'livestream', label: 'AI Host Live Stream', icon: Video },
  { id: 'brandidentity', label: 'Generate Brand Identity', icon: Palette },
];

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
      case 'videoeditor':
        return <AIVideoEditor />;
      case 'analytics':
        return <AnalyticsInsights />;
      case 'livestream':
        return <AIHostLiveStream />;
      case 'brandidentity':
        return <GenerateBrandIdentity />;
      default:
        return <ContentPlanner />;
    }
  };

  const activeItem = menuItems.find(item => item.id === activeSection);

  if (!user) return null;

  return (
    <AuroraBackground>
      <div className="flex min-h-screen w-full">
        <SidebarProvider defaultOpen={!isMobile}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <DashboardSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          )}
          
          <main className="flex-1 overflow-auto">
            {/* Mobile Header with Dropdown */}
            {isMobile && (
              <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                  </Link>
                  <Link to="/" className="flex items-center">
                    <img 
                      src="/lovable-uploads/viralin-logo.png" 
                      alt="Viralin Logo" 
                      className="h-7 w-auto"
                    />
                  </Link>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                    >
                      {activeItem && <activeItem.icon className="w-4 h-4" />}
                      <span className="max-w-[120px] truncate">{activeItem?.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-slate-800 border-slate-700"
                  >
                    {menuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-3 cursor-pointer ${
                          activeSection === item.id 
                            ? 'bg-purple-600/30 text-purple-300' 
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
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
