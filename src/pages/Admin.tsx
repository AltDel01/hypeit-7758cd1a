
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { imageRequestService } from '@/services/requests';
import type { ImageRequest } from '@/services/requests';
import { RequestList } from '@/components/admin/RequestList';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { TestRequestForm } from '@/components/admin/TestRequestForm';
import { useImageUpload } from '@/hooks/useImageUpload';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('new');
  const [requests, setRequests] = useState<ImageRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
  const [resultImage, setResultImage] = useState<File | null>(null);
  const [testPrompt, setTestPrompt] = useState('A beautiful mountain landscape');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const hasAdminAccess = user?.email === 'putra.ekadarma@gmail.com' || true;

  const { isUploading, uploadProgress, handleUploadResult } = useImageUpload({
    selectedRequest,
    onRequestUpdated: () => {
      setRequests(imageRequestService.getAllRequests());
      if (selectedRequest) {
        const updatedRequest = imageRequestService.getRequestById(selectedRequest.id);
        setSelectedRequest(updatedRequest);
      }
    }
  });

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

  const handleCreateTestRequest = () => {
    if (!user) {
      toast.error("You must be logged in to create a test request");
      return;
    }

    try {
      const newRequest = imageRequestService.createRequest(
        user.id || 'anonymous',
        user.email || 'Test User',
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
      setRequests([]);
      setSelectedRequest(null);
      toast.success("All requests cleared");
      setDebugInfo("All requests cleared from local storage");
    }
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

  const handleUploadResult = async () => {
    if (!selectedRequest || !resultImage) {
      toast.error("Please select a request and upload a result image");
      return;
    }
    
    setIsUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 400);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const imageUrl = URL.createObjectURL(resultImage);
      
      const updatedRequest = imageRequestService.uploadResult(selectedRequest.id, imageUrl);
      
      if (updatedRequest) {
        setRequests(imageRequestService.getAllRequests());
        setSelectedRequest(updatedRequest);
        clearInterval(interval);
        setUploadProgress(100);
        
        toast.success("Image uploaded and request completed!");
        
        const imageGeneratedEvent = new CustomEvent('imageGenerated', {
          detail: {
            imageUrl,
            prompt: selectedRequest.prompt,
            aspectRatio: selectedRequest.aspectRatio,
            requestId: selectedRequest.id
          }
        });
        
        window.dispatchEvent(imageGeneratedEvent);
      } else {
        toast.error("Failed to update request with result image");
      }
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to upload image");
      clearInterval(interval);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

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
              onCreateTest={handleCreateTestRequest}
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
