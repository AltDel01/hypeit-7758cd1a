import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Wand2, BarChart3, ArrowLeft, Video, Palette, Clapperboard, ChevronDown, Sparkles, Scissors } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DashboardSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const [videoEditorOpen, setVideoEditorOpen] = useState(
    activeSection === 'videoeditor' || activeSection === 'viralclips'
  );

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

  const videoEditorSubItems = [
    { 
      id: 'videoeditor', 
      label: 'Video Editor', 
      icon: Clapperboard,
      description: 'Edit videos like a pro'
    },
    { 
      id: 'viralclips', 
      label: 'Viral Clips', 
      icon: Sparkles,
      description: 'Find viral moments'
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
              {/* Regular menu items before Video Editor */}
              {menuItems.slice(0, 2).map((item) => (
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

              {/* AI Video Editor with submenu */}
              <SidebarMenuItem>
                <Collapsible open={videoEditorOpen} onOpenChange={setVideoEditorOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full h-auto py-4 px-4 rounded-xl transition-all duration-200 hover:scale-102 hover:bg-purple-600/20 hover:shadow-lg active:scale-95 flex flex-col items-start gap-1"
                      tooltip="AI Video Editor"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Clapperboard className="w-5 h-5 shrink-0" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">AI Video Editor</span>
                            <span className="text-xs text-muted-foreground">Edit videos like a pro</span>
                          </div>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          videoEditorOpen && "rotate-180"
                        )} />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 mt-1 space-y-1">
                    {videoEditorSubItems.map((subItem) => (
                      <SidebarMenuButton
                        key={subItem.id}
                        onClick={() => setActiveSection(subItem.id)}
                        isActive={activeSection === subItem.id}
                        className="w-full h-auto py-3 px-4 rounded-lg transition-all duration-200 hover:bg-purple-600/20 flex items-center gap-3"
                        tooltip={subItem.label}
                      >
                        <subItem.icon className="w-4 h-4 shrink-0" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{subItem.label}</span>
                          <span className="text-xs text-muted-foreground">{subItem.description}</span>
                        </div>
                        {activeSection === subItem.id && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b616d6]" />
                        )}
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Remaining menu items */}
              {menuItems.slice(2).map((item) => (
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
