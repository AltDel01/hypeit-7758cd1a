
import { useState } from 'react';
import { toast } from 'sonner';
import { imageRequestService } from '@/services/requests';

interface UseTestRequestProps {
  loadRequests: () => void;
  setDebugInfo: (info: string) => void;
}

export const useTestRequest = ({ loadRequests, setDebugInfo }: UseTestRequestProps) => {
  const [testPrompt, setTestPrompt] = useState('A beautiful mountain landscape');

  const handleCreateTestRequest = (userId: string, userEmail: string | null) => {
    if (!userId) {
      toast.error("You must be logged in to create a test request");
      return;
    }

    try {
      const newRequest = imageRequestService.createRequest(
        userId,
        userEmail || 'Test User',
        testPrompt,
        '16:9',
        null
      );
      
      toast.success("Test request created successfully!");
      loadRequests();
      setDebugInfo(`Test request created with ID: ${newRequest.id}`);
    } catch (error) {
      console.error("Error creating test request:", error);
      toast.error("Failed to create test request");
      setDebugInfo(`Error creating request: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleClearAllRequests = () => {
    if (window.confirm("Are you sure you want to clear all requests? This cannot be undone.")) {
      imageRequestService.clearAllRequests();
      loadRequests();
      setDebugInfo("All requests cleared from local storage");
      toast.success("All requests cleared");
    }
  };

  return {
    testPrompt,
    setTestPrompt,
    handleCreateTestRequest,
    handleClearAllRequests
  };
};
