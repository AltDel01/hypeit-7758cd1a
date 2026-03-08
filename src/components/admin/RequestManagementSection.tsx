import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestList } from '@/components/admin/RequestList';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { claimGenerationRequest, unassignGenerationRequest } from '@/services/generationRequestService';
import { toast } from 'sonner';
import type { GenerationRequest } from '@/services/generationRequestService';

export const RequestManagementSection = () => {
  const { user } = useAuth();
  const {
    requests,
    selectedRequest,
    setSelectedRequest,
    handleRefresh,
    handleUpdateStatus,
    loadRequests
  } = useRequestManagement();

  const { isUploading, uploadProgress, handleUploadResult } = useImageUpload({
    selectedRequest,
    onRequestUpdated: () => {
      handleRefresh();
    }
  });

  const [activeTab, setActiveTab] = React.useState<string>('new');
  const [resultImage, setResultImage] = React.useState<File | null>(null);
  
  const refreshRequests = useCallback(() => {
    handleRefresh();
    toast.info("Refreshing request list...");
  }, [handleRefresh]);

  const handleClaimRequest = useCallback(async (requestId: string) => {
    const success = await claimGenerationRequest(requestId);
    if (success) {
      toast.success("Request claimed! You can now work on it.");
      await loadRequests();
    } else {
      toast.error("Failed to claim request");
    }
  }, [loadRequests]);

  const handleUnassignRequest = useCallback(async (requestId: string) => {
    const success = await unassignGenerationRequest(requestId);
    if (success) {
      toast.success("Request unassigned");
      await loadRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } else {
      toast.error("Failed to unassign request");
    }
  }, [loadRequests, selectedRequest, setSelectedRequest]);
  
  // Auto-refresh every 15 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadRequests();
    }, 15000);
    return () => clearInterval(refreshInterval);
  }, [loadRequests]);

  // Refresh on initial load, visibility change, and broadcast
  useEffect(() => {
    refreshRequests();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshRequests();
      }
    };
    
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('image_requests_channel');
        broadcastChannel.onmessage = () => refreshRequests();
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error);
    }
    
    const handleRequestEvent = () => refreshRequests();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('imageRequestCreated', handleRequestEvent);
    window.addEventListener('imageRequestsUpdated', handleRequestEvent);
    window.addEventListener('imageRequestsCleared', handleRequestEvent);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('imageRequestCreated', handleRequestEvent);
      window.removeEventListener('imageRequestsUpdated', handleRequestEvent);
      window.removeEventListener('imageRequestsCleared', handleRequestEvent);
      if (broadcastChannel) broadcastChannel.close();
    };
  }, [refreshRequests]);

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mine') return request.assigned_to === user?.id;
    return request.status === activeTab;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Editor Dashboard</h1>
          <p className="text-muted-foreground">Claim and process user requests</p>
        </div>
        <Button 
          onClick={refreshRequests} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="mine">My Tasks</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <RequestList 
                requests={filteredRequests}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
                onUpdateStatus={handleUpdateStatus}
                onClaimRequest={handleClaimRequest}
                currentUserId={user?.id}
              />
            </div>
          </Tabs>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
          {selectedRequest ? (
            <RequestDetails 
              request={selectedRequest}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              resultImage={resultImage}
              onUpdateStatus={handleUpdateStatus}
              onUploadResult={() => resultImage && handleUploadResult(resultImage)}
              setResultImage={setResultImage}
              onUnassign={handleUnassignRequest}
              currentUserId={user?.id}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
