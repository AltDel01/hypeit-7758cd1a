
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import { imageRequestService } from '@/services/requests';
import { useAuth } from '@/contexts/AuthContext';

const GeneratedContent = () => {
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState(15); // Default to 15
  const { user } = useAuth();
  
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { progress } = event.detail;
      console.log("Progress update in Analytics:", progress);
      setGenerationProgress(progress);
      setIsGenerating(true);
    };
    
    window.addEventListener('imageGenerationProgress', handleProgressUpdate as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerationProgress', handleProgressUpdate as EventListener);
    };
  }, []);
  
  useEffect(() => {
    // Check for any active requests when component mounts
    if (user) {
      const activeRequests = imageRequestService.getActiveRequestsForUser(user.id);
      if (activeRequests.length > 0) {
        setIsGenerating(true);
        // Use progress from most recent request
        setGenerationProgress(activeRequests[0].progress || 0);
      }
    }
    
    // Get the batch size from local storage
    const storedBatchSize = parseInt(localStorage.getItem('selectedImagesPerBatch') || '15', 10);
    setBatchSize(storedBatchSize > 3 ? storedBatchSize : 15); // Fallback to 15 if invalid
  }, [user]);

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
      
      {isGenerating && (
        <div className="bg-background/30 border border-purple-800/30 backdrop-blur-md rounded-xl p-6 flex flex-col items-center">
          <h3 className="text-xl font-medium mb-4 text-white text-center">Generating Your Images</h3>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircularProgressIndicator 
              progress={generationProgress} 
              size="large" 
              showPercentage={true} 
            />
            <p className="text-gray-300">
              Your images are being generated. This may take a few minutes.
            </p>
            <div className="text-sm text-gray-400 mt-2">
              Your {batchSize} images will appear here once ready
            </div>
          </div>
        </div>
      )}
      
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
