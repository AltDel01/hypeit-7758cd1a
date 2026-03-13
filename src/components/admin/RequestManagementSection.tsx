import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { RequestList } from '@/components/admin/RequestList';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useAuth } from '@/contexts/AuthContext';
import { claimGenerationRequest } from '@/services/generationRequestService';
import { toast } from 'sonner';

export const RequestManagementSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requests, handleRefresh, loadRequests } = useRequestManagement();

  const [activeTab, setActiveTab] = React.useState<string>('new');

  const refreshRequests = useCallback(() => {
    handleRefresh();
    toast.info('Refreshing request list...');
  }, [handleRefresh]);

  const handleOpenRequest = useCallback(
    (requestId: string) => {
      navigate(`/admin/requests/${requestId}`);
    },
    [navigate]
  );

  const handleClaimAndOpenRequest = useCallback(
    async (requestId: string) => {
      const success = await claimGenerationRequest(requestId);
      if (success) {
        toast.success('Request claimed! Opening workspace...');
        await loadRequests();
        navigate(`/admin/requests/${requestId}`);
      } else {
        toast.error('Failed to claim request');
      }
    },
    [loadRequests, navigate]
  );

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

  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mine') return request.assigned_to === user?.id;
    return request.status === activeTab;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">Editor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Claim and process user requests</p>
        </div>
        <Button onClick={refreshRequests} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4 h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="mine">My Tasks</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <RequestList
            requests={filteredRequests}
            onOpenRequest={handleOpenRequest}
            onClaimAndOpenRequest={handleClaimAndOpenRequest}
            currentUserId={user?.id}
          />
        </div>
      </Tabs>
    </div>
  );
};
