import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Wand2, BarChart3, ArrowLeft, Video, Palette } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';

interface DashboardSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const menuItems = [
    { 
      id: 'planner', 
      label: 'Content Planner', 
      icon: Calendar,
      description: 'Plan & schedule posts'
    },
    { 
      id: 'generator', 
      label: 'AI Content Generator', 
      icon: Wand2,
      description: 'Create visuals & videos'
    },
    { 
      id: 'analytics', 
      label: 'Analytics & Insights', 
      icon: BarChart3,
      description: 'Track performance'
    },
    { 
      id: 'livestream', 
      label: 'AI Host Live Stream', 
      icon: Video,
      description: 'AI-powered streaming'
    },
    { 
      id: 'brandidentity', 
      label: 'Generate Brand Identity', 
      icon: Palette,
      description: 'Create brand assets'
    },
  ];

  return (
    <Sidebar className="border-r border-slate-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Header with Logo */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <Link to="/" className="flex items-center">
                  <img 
                    src="/lovable-uploads/viralin-logo.png" 
                    alt="Viralin Logo" 
                    className="h-8 w-auto"
                  />
                </Link>
              </div>
              <SidebarTrigger />
            </div>

            {/* Navigation Menu */}
            <SidebarMenu className="space-y-2 p-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full h-auto py-4 px-4 rounded-xl transition-all duration-200 hover:scale-102 hover:bg-purple-600/20 hover:shadow-lg active:scale-95 flex flex-col items-start gap-1"
                    tooltip={item.label}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </div>
                    {activeSection === item.id && (
                      <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;
