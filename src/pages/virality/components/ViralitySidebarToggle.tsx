
import React from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

const ViralitySidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  if (state === "expanded" && !isMobile) {
    return null;
  }
  
  // For mobile, we'll show a different type of toggle
  if (isMobile) {
    return (
      <div className="fixed left-4 top-24 z-50">
        <Button 
          onClick={toggleSidebar} 
          size="icon" 
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg hover:bg-purple-600/20"
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Show Menu</span>
        </Button>
      </div>
    );
  }
  
  // For desktop when collapsed
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

export default ViralitySidebarToggle;
