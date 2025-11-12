
import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestList } from '@/components/admin/RequestList';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

export const RequestManagementSection = () => {
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
      // Force a refresh of the requests list after upload
      handleRefresh();
    }
  });

  const [activeTab, setActiveTab] = React.useState<string>('new');
  const [resultImage, setResultImage] = React.useState<File | null>(null);
  
  // Memoized refresh function to avoid unnecessary rerenders
  const refreshRequests = useCallback(() => {
    handleRefresh();
    toast.info("Refreshing request list...");
  }, [handleRefresh]);
  
  // Auto-refresh requests every 15 seconds (reduced frequency to avoid excessive refreshes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing request list...');
      loadRequests();
    }, 15000);
    
    return () => clearInterval(refreshInterval);
  }, [loadRequests]);

  // Refresh on initial load, tab visibility change, and broadcast messages
  useEffect(() => {
    // Initial load
    refreshRequests();
    
    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing requests...');
        refreshRequests();
      }
    };
    
    // Setup broadcast channel for direct tab-to-tab communication
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('image_requests_channel');
        broadcastChannel.onmessage = (event) => {
          console.log('BroadcastChannel message received in RequestManagementSection:', event.data);
          refreshRequests();
        };
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error);
    }
    
    // Listen for custom events
    const handleRequestEvent = () => {
      console.log('Custom request event received, refreshing...');
      refreshRequests();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('imageRequestCreated', handleRequestEvent);
    window.addEventListener('imageRequestsUpdated', handleRequestEvent);
    window.addEventListener('imageRequestsCleared', handleRequestEvent);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('imageRequestCreated', handleRequestEvent);
      window.removeEventListener('imageRequestsUpdated', handleRequestEvent);
      window.removeEventListener('imageRequestsCleared', handleRequestEvent);
      
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [refreshRequests]);

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Manage image generation requests</p>
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
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <RequestList 
                requests={filteredRequests}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </Tabs>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
          {selectedRequest ? (
            <RequestDetails 
              request={selectedRequest}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              resultImage={resultImage}
              onUpdateStatus={handleUpdateStatus}
              onUploadResult={() => resultImage && handleUploadResult(resultImage)}
              setResultImage={setResultImage}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
