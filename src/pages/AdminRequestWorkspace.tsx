import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Button } from '@/components/ui/button';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { claimGenerationRequest, unassignGenerationRequest } from '@/services/generationRequestService';
import { toast } from 'sonner';

const AdminRequestWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const [resultImage, setResultImage] = React.useState<File | null>(null);

  const {
    requests,
    selectedRequest,
    setSelectedRequest,
    handleUpdateStatus,
    loadRequests,
  } = useRequestManagement();

  const { isUploading, uploadProgress, handleUploadResult } = useImageUpload({
    selectedRequest,
    onRequestUpdated: () => {
      loadRequests();
    },
  });

  React.useEffect(() => {
    if (!requestId) return;
    const match = requests.find((r) => r.id === requestId);
    setSelectedRequest(match ?? null);
  }, [requests, requestId, setSelectedRequest]);

  React.useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadRequests();
    }, 15000);
    return () => clearInterval(refreshInterval);
  }, [loadRequests]);

  const handleClaimRequest = React.useCallback(
    async (id: string) => {
      const success = await claimGenerationRequest(id);
      if (success) {
        toast.success('Request claimed');
        await loadRequests();
      } else {
        toast.error('Failed to claim request');
      }
    },
    [loadRequests]
  );

  const handleUnassignRequest = React.useCallback(
    async (id: string) => {
      const success = await unassignGenerationRequest(id);
      if (success) {
        toast.success('Request unassigned');
        await loadRequests();
      } else {
        toast.error('Failed to unassign request');
      }
    },
    [loadRequests]
  );

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to request list
            </Button>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6">
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
                  onClaimRequest={handleClaimRequest}
                  currentUserId={user?.id}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Request not found or still loading...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default AdminRequestWorkspace;
