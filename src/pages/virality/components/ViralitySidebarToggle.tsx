
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

const ViralitySidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  
  if (state === "expanded") {
    return null;
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

export default ViralitySidebarToggle;
