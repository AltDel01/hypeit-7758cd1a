
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart, TrendingUp } from 'lucide-react';
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
} from "@/components/ui/sidebar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ViralitySidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ViralitySidebar: React.FC<ViralitySidebarProps> = ({ activeSection, setActiveSection }) => {
  // Menu items
  const menuItems = [
    { id: 'strategy', label: 'Social Media Strategy', icon: TrendingUp },
    { id: 'analytics', label: 'Social Media Influencers', icon: BarChart },
  ];

  return (
    <div className="flex">
      <Sidebar variant="sidebar" className="border-r border-slate-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
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
  );
};

export default ViralitySidebar;
