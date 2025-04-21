
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Clock, CheckCircle } from 'lucide-react';
import ImageUploader from '@/components/tabs/ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import type { ImageRequest } from '@/types/imageRequest';

interface RequestDetailsProps {
  selectedRequest: ImageRequest;
  resultImage: File | null;
  setResultImage: (file: File | null) => void;
  isUploading: boolean;
  uploadProgress: number;
  onUpdateStatus: (id: string, status: 'in-progress') => void;
  onUploadResult: () => void;
  formatDate: (date: string) => string;
}

const RequestDetails = ({
  selectedRequest,
  resultImage,
  setResultImage,
  isUploading,
  uploadProgress,
  onUpdateStatus,
  onUploadResult,
  formatDate,
}: RequestDetailsProps) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-white">Request Details</h2>
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          selectedRequest.status === 'new' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : selectedRequest.status === 'in-progress'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }`}>
          {selectedRequest.status === 'new' && <Clock className="w-3 h-3 mr-1" />}
          {selectedRequest.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
          {selectedRequest.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
        </span>
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
                  onClick={() => onUpdateStatus(selectedRequest.id, 'in-progress')}
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
  );
};

export default RequestDetails;
