
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import ImageUploader from '@/components/tabs/ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import { StatusBadge } from './StatusBadge';
import type { ImageRequest } from '@/services/requests';

interface RequestDetailsProps {
  request: ImageRequest;
  isUploading: boolean;
  uploadProgress: number;
  resultImage: File | null;
  onUpdateStatus: (id: string, status: 'in-progress') => void;
  onUploadResult: () => void;
  setResultImage: (file: File | null) => void;
}

export const RequestDetails = ({
  request,
  isUploading,
  uploadProgress,
  resultImage,
  onUpdateStatus,
  onUploadResult,
  setResultImage
}: RequestDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-white">Request Details</h2>
      <div className="mb-4">
        <StatusBadge status={request.status} />
        <p className="mt-2 text-sm text-gray-400">Last updated: {formatDate(request.updatedAt)}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400">User</h3>
          <p className="text-white">{request.userName}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400">Prompt</h3>
          <p className="text-white bg-gray-800/50 p-2 rounded-md">{request.prompt}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400">Aspect Ratio</h3>
          <p className="text-white">{request.aspectRatio}</p>
        </div>
        
        {request.referenceImage && (
          <div>
            <h3 className="text-sm font-medium text-gray-400">Reference Image</h3>
            <div className="mt-1 h-40 bg-gray-800/50 rounded-md overflow-hidden">
              <img 
                src={request.referenceImage} 
                alt="Reference" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        {request.status !== 'completed' ? (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Upload Result Image</h3>
            <ImageUploader 
              productImage={resultImage} 
              setProductImage={setResultImage} 
              className="h-40"
            />
            
            {request.status === 'new' ? (
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onUpdateStatus(request.id, 'in-progress')}
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
                    onClick={onUploadResult}
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
                src={request.resultImage || ''} 
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
  );
};
