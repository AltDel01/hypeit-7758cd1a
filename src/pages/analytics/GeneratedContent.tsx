
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const GeneratedContent = () => {
  const handleSchedulePost = () => {
    // Future implementation: Add schedule post functionality
    console.log('Schedule Post button clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Generated Content</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSchedulePost}
                variant="secondary" 
                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Posts</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Schedule your content for posting
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background/30 border border-purple-800/30 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-xl font-medium mb-4 text-white">Recent Generated Posts</h3>
          <p className="text-gray-300">No generated content yet. Create some content to see it here.</p>
        </div>
        
        <div className="bg-background/30 border border-purple-800/30 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-xl font-medium mb-4 text-white">Performance Stats</h3>
          <p className="text-gray-300">Connect your social accounts to see performance data.</p>
        </div>
      </div>
      
      <div className="bg-background/30 border border-purple-800/30 backdrop-blur-md rounded-xl p-6">
        <h3 className="text-xl font-medium mb-4 text-white">Content Calendar</h3>
        <p className="text-gray-300">No scheduled posts. Use the Schedule Posts button to plan your content.</p>
      </div>
    </div>
  );
};

export default GeneratedContent;
