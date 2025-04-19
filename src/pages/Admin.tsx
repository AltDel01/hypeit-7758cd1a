
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/tabs/ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';

// Define request status types
type RequestStatus = 'new' | 'in-progress' | 'completed';

// Define image generation request interface
interface ImageRequest {
  id: string;
  userId: string;
  userName: string;
  prompt: string;
  aspectRatio: string;
  status: RequestStatus;
  createdAt: string;
  productImage: string | null;
  resultImage: string | null;
  updatedAt: string;
}

// Mock data - in a real app, this would come from your database
const mockRequests: ImageRequest[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    prompt: 'A stunning landscape with mountains and a sunset',
    aspectRatio: '1:1',
    status: 'new',
    createdAt: '2025-04-18T14:35:00Z',
    productImage: null,
    resultImage: null,
    updatedAt: '2025-04-18T14:35:00Z'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    prompt: 'A futuristic city with flying cars and tall buildings',
    aspectRatio: '9:16',
    status: 'in-progress',
    createdAt: '2025-04-18T09:15:00Z',
    productImage: 'https://source.unsplash.com/random/800x800/?cityscape',
    resultImage: null,
    updatedAt: '2025-04-18T10:20:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Robert Johnson',
    prompt: 'A vintage car on a coastal road',
    aspectRatio: '1:1',
    status: 'completed',
    createdAt: '2025-04-17T16:45:00Z',
    productImage: null,
    resultImage: 'https://source.unsplash.com/random/800x800/?vintagecars',
    updatedAt: '2025-04-17T18:30:00Z'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('new');
  const [requests, setRequests] = useState<ImageRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
  const [resultImage, setResultImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Simulating admin check - in a real app, you would check user roles
  const isAdmin = true; // For demo purposes, everyone is an admin

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  // Handle request selection
  const handleSelectRequest = (request: ImageRequest) => {
    setSelectedRequest(request);
    setResultImage(null); // Reset result image when selecting a new request
  };

  // Handle status update
  const handleUpdateStatus = (id: string, status: RequestStatus) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === id 
        ? { ...req, status, updatedAt: new Date().toISOString() } 
        : req
      )
    );
    
    toast.success(`Request ${id} marked as ${status}`);
    
    // If current request is being updated, update selectedRequest too
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
    }
  };

  // Handle uploading result image and completing request
  const handleUploadResult = async () => {
    if (!selectedRequest || !resultImage) {
      toast.error("Please select a request and upload a result image");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 400);
    
    // Simulate API call to upload image
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create object URL for the uploaded image
      const imageUrl = URL.createObjectURL(resultImage);
      
      // Update the request with the result image
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
          ? { ...req, resultImage: imageUrl, status: 'completed', updatedAt: new Date().toISOString() } 
          : req
        )
      );
      
      // Update selected request
      setSelectedRequest(prev => prev ? { 
        ...prev, 
        resultImage: imageUrl, 
        status: 'completed',
        updatedAt: new Date().toISOString() 
      } : null);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success("Image uploaded and request completed!");
      
      // Trigger a custom event that the main page can listen to
      const imageGeneratedEvent = new CustomEvent('imageGenerated', {
        detail: {
          imageUrl,
          prompt: selectedRequest.prompt,
          aspectRatio: selectedRequest.aspectRatio,
          requestId: selectedRequest.id
        }
      });
      
      window.dispatchEvent(imageGeneratedEvent);
      
      // Reset after a delay
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

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Status badge component
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

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mb-6">Manage image generation requests</p>
            
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
