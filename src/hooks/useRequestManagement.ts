
import { useState } from 'react';
import { toast } from 'sonner';
import type { ImageRequest } from '@/services/requests';
import { imageRequestService } from '@/services/requests';

export const useRequestManagement = () => {
  const [requests, setRequests] = useState<ImageRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const loadRequests = () => {
    const allRequests = imageRequestService.getAllRequests();
    console.log('Loaded requests from service:', allRequests);
    setRequests(allRequests);
    setDebugInfo(`Total requests: ${allRequests.length}, Storage key: ${imageRequestService.getStorageKey()}`);
  };

  const handleRefresh = () => {
    const reloaded = imageRequestService.forceReload();
    setRequests(reloaded);
    toast.info("Request list refreshed");
    setDebugInfo(`Force reloaded: ${reloaded.length} requests found`);
  };

  const handleUpdateStatus = (id: string, status: 'in-progress') => {
    const updatedRequest = imageRequestService.updateRequestStatus(id, status);
    
    if (updatedRequest) {
      loadRequests();
      toast.success(`Request ${id} marked as ${status}`);
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(updatedRequest);
      }
    } else {
      toast.error(`Failed to update request ${id}`);
    }
  };

  return {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    debugInfo,
    setDebugInfo,
    loadRequests,
    handleRefresh,
    handleUpdateStatus
  };
};
