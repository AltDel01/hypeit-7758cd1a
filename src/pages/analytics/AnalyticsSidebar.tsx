
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Instagram, CalendarDays, ChartBar, Users, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const analyticsRoutes = [
  {
    label: "Connect Accounts",
    value: "connect",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    label: "Schedule Posts",
    value: "schedule",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    label: "Content Analysis",
    value: "content",
    icon: <ChartBar className="h-5 w-5" />,
  },
  {
    label: "Influencer Analytics",
    value: "influencers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Influencer Outreach",
    value: "outreach",
    icon: <Mail className="h-5 w-5" />,
  },
];

interface AnalyticsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AnalyticsSidebar = ({ activeTab, setActiveTab }: AnalyticsSidebarProps) => {
  return (
    <Sidebar className="bg-gray-800 border-none min-w-[210px] max-w-[220px]">
      <SidebarContent className="!p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsRoutes.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    variant="default"
                    isActive={activeTab === item.value}
                    onClick={() => setActiveTab(item.value)}
                    className="flex items-center gap-2 rounded-md py-2 px-3 w-full text-white data-[active=true]:bg-[#7a45e6] data-[active=true]:text-white hover:bg-gray-700 transition-all text-base font-medium"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AnalyticsSidebar;
