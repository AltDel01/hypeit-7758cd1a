import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, CheckCircle, Clock, AlertTriangle, Loader2, RefreshCw, Plus } from 'lucide-react';
import ImageUploader from '@/components/tabs/ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import imageRequestService, { ImageRequest, RequestStatus } from '@/services/requests';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('new');
  const [requests, setRequests] = useState<ImageRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
  const [resultImage, setResultImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [testPrompt, setTestPrompt] = useState('A beautiful mountain landscape');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const hasAdminAccess = user?.email === 'putra.ekadarma@gmail.com' || true;

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

  const handleSelectRequest = (request: ImageRequest) => {
    setSelectedRequest(request);
    setResultImage(null);
  };

  const handleUpdateStatus = (id: string, status: RequestStatus) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            New
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

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
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold mb-4 text-white">Create Test Request</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-2">
                  <Label htmlFor="test-prompt">Test Prompt</Label>
                  <Input 
                    id="test-prompt"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a test prompt"
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateTestRequest} 
                    className="flex items-center gap-2"
                    variant="newPurple"
                  >
                    <Plus className="h-4 w-4" />
                    Create Test Request
                  </Button>
                  <Button 
                    onClick={handleClearAllRequests} 
                    variant="destructive"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              {debugInfo && (
                <div className="mt-3 p-2 bg-gray-800/50 rounded text-sm text-gray-400 font-mono">
                  <p>Debug: {debugInfo}</p>
                </div>
              )}
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
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Prompt</TableHead>
                            <TableHead>Aspect Ratio</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                No requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow 
                                key={request.id} 
                                className={`cursor-pointer ${selectedRequest?.id === request.id ? 'bg-gray-800/50' : ''}`}
                                onClick={() => handleSelectRequest(request)}
                              >
                                <TableCell>{request.id}</TableCell>
                                <TableCell>{request.userName}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.prompt}</TableCell>
                                <TableCell>{request.aspectRatio}</TableCell>
                                <TableCell><StatusBadge status={request.status} /></TableCell>
                                <TableCell>{formatDate(request.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                    {request.status === 'new' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleUpdateStatus(request.id, 'in-progress')}
                                      >
                                        Start
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Tabs>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                {selectedRequest ? (
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-white">Request Details</h2>
                    <div className="mb-4">
                      <StatusBadge status={selectedRequest.status} />
                      <p className="mt-2 text-sm text-gray-400">Last updated: {formatDate(selectedRequest.updatedAt)}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">User</h3>
                        <p className="text-white">{selectedRequest.userName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Prompt</h3>
                        <p className="text-white bg-gray-800/50 p-2 rounded-md">{selectedRequest.prompt}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Aspect Ratio</h3>
                        <p className="text-white">{selectedRequest.aspectRatio}</p>
                      </div>
                      
                      {selectedRequest.productImage && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-400">Reference Image</h3>
                          <div className="mt-1 h-40 bg-gray-800/50 rounded-md overflow-hidden">
                            <img 
                              src={selectedRequest.productImage} 
                              alt="Reference" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedRequest.status !== 'completed' ? (
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Upload Result Image</h3>
                          <ImageUploader 
                            productImage={resultImage} 
                            setProductImage={setResultImage} 
                            className="h-40"
                          />
                          
                          {selectedRequest.status === 'new' ? (
                            <div className="flex space-x-2 mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(selectedRequest.id, 'in-progress')}
                                className="flex-1"
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Mark In Progress
                              </Button>
                            </div>
                          ) : (
                            <div className="flex space-x-2 mt-4">
                              {isUploading ? (
                                <div className="w-full flex flex-col items-center justify-center p-4">
                                  <CircularProgressIndicator 
                                    progress={uploadProgress} 
                                    size="medium"
                                  />
                                  <p className="mt-2 text-sm text-gray-400">Uploading...</p>
                                </div>
                              ) : (
                                <Button 
                                  variant="newPurple"
                                  disabled={!resultImage}
                                  onClick={handleUploadResult}
                                  className="flex-1"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload & Complete
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-sm font-medium text-gray-400">Result Image</h3>
                          <div className="mt-1 h-40 bg-gray-800/50 rounded-md overflow-hidden">
                            <img 
                              src={selectedRequest.resultImage || ''} 
                              alt="Result" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-green-500 mt-1 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
