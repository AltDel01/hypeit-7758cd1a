import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  GenerationRequest, 
  fetchAllGenerationRequests, 
  updateGenerationRequestStatus 
} from '@/services/generationRequestService';

export type RequestStatus = 'new' | 'in-progress' | 'completed' | 'failed';

export const useRequestManagement = () => {
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequest | null>(null);

  const loadRequests = useCallback(async () => {
    const allRequests = await fetchAllGenerationRequests();
    console.log('Loaded requests from Supabase:', allRequests);
    setRequests(allRequests);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRefresh = useCallback(async () => {
    await loadRequests();
    toast.info("Request list refreshed");
  }, [loadRequests]);

  const handleUpdateStatus = useCallback(async (id: string, status: RequestStatus, resultUrl?: string) => {
    const success = await updateGenerationRequestStatus(id, status, resultUrl);
    
    if (success) {
      const allRequests = await fetchAllGenerationRequests();
      setRequests(allRequests);
      toast.success(`Request marked as ${status}`);
      
      // Update selected request if it was the one that changed
      if (selectedRequest?.id === id) {
        const updatedRequest = allRequests.find(r => r.id === id);
        if (updatedRequest) {
          setSelectedRequest(updatedRequest);
        }
      }
    } else {
      toast.error(`Failed to update request`);
    }
  }, [selectedRequest]);

  return {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    loadRequests,
    handleRefresh,
    handleUpdateStatus
  };
};
