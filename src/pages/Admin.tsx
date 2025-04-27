import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { RequestList } from '@/components/admin/RequestList';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { TestRequestForm } from '@/components/admin/TestRequestForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useTestRequest } from '@/hooks/useTestRequest';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('new');
  const [resultImage, setResultImage] = useState<File | null>(null);
  
  const {
    requests,
    selectedRequest,
    setSelectedRequest,
    debugInfo,
    loadRequests,
    handleRefresh,
    handleUpdateStatus
  } = useRequestManagement();

  const {
    testPrompt,
    setTestPrompt,
    handleCreateTestRequest,
    handleClearAllRequests
  } = useTestRequest({
    loadRequests,
    setDebugInfo
  });

  const { isUploading, uploadProgress, handleUploadResult } = useImageUpload({
    selectedRequest,
    onRequestUpdated: loadRequests
  });

  useEffect(() => {
    loadRequests();

    const intervalId = setInterval(loadRequests, 5000);
    
    const handleNewRequest = () => {
      console.log("Admin: Detected new image request created, refreshing list");
      loadRequests();
    };
    
    window.addEventListener('imageRequestCreated', handleNewRequest);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('imageRequestCreated', handleNewRequest);
    };
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Manage image generation requests</p>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <TestRequestForm 
              testPrompt={testPrompt}
              onTestPromptChange={setTestPrompt}
              onCreateTest={() => handleCreateTestRequest(user.id, user.email)}
              onClearAll={handleClearAllRequests}
              debugInfo={debugInfo}
            />
            
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
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Admin;
