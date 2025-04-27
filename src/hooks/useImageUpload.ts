
import { useState } from 'react';
import { toast } from 'sonner';
import type { ImageRequest } from '@/services/requests';
import { imageRequestService } from '@/services/requests';

interface UseImageUploadProps {
  selectedRequest: ImageRequest | null;
  onRequestUpdated: () => void;
}

export const useImageUpload = ({ selectedRequest, onRequestUpdated }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadResult = async (resultImage: File) => {
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
        onRequestUpdated();
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
      
    } catch (error) {
      toast.error("Failed to upload image");
      clearInterval(interval);
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleUploadResult
  };
};
