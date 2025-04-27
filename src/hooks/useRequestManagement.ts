
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ImageRequest } from '@/services/requests';
import { imageRequestService } from '@/services/requests';

export const useRequestManagement = () => {
  const [requests, setRequests] = useState<ImageRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Add useEffect to listen for image request events
  useEffect(() => {
    const handleRequestCreated = (event: CustomEvent) => {
      console.log('Request created event received:', event.detail);
      loadRequests();
    };

    const handleRequestUpdated = (event: CustomEvent) => {
      console.log('Request updated event received:', event.detail);
      loadRequests();
      
      // Update selected request if it was the one that changed
      if (selectedRequest && event.detail.request && selectedRequest.id === event.detail.request.id) {
        setSelectedRequest(event.detail.request);
      }
    };

    const handleRequestCompleted = (event: CustomEvent) => {
      console.log('Request completed event received:', event.detail);
      loadRequests();
      toast.success(`Request ${event.detail.request.id} completed`);
      
      // Update selected request if it was the one that changed
      if (selectedRequest && event.detail.request && selectedRequest.id === event.detail.request.id) {
        setSelectedRequest(event.detail.request);
      }
    };
    
    const handleRequestsUpdated = (event: CustomEvent) => {
      console.log('Requests updated event received:', event.detail);
      setRequests(event.detail.requests);
    };

    // Initial load
    loadRequests();
    
    // Set up event listeners
    window.addEventListener('imageRequestCreated', handleRequestCreated as EventListener);
    window.addEventListener('imageRequestUpdated', handleRequestUpdated as EventListener);
    window.addEventListener('imageRequestCompleted', handleRequestCompleted as EventListener);
    window.addEventListener('imageRequestsUpdated', handleRequestsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('imageRequestCreated', handleRequestCreated as EventListener);
      window.removeEventListener('imageRequestUpdated', handleRequestUpdated as EventListener);
      window.removeEventListener('imageRequestCompleted', handleRequestCompleted as EventListener);
      window.removeEventListener('imageRequestsUpdated', handleRequestsUpdated as EventListener);
    };
  }, [selectedRequest]);

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
