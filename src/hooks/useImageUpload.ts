import { useState } from 'react';
import { toast } from 'sonner';
import type { GenerationRequest } from '@/services/generationRequestService';
import { updateGenerationRequestStatus } from '@/services/generationRequestService';
import { supabase } from '@/integrations/supabase/client';

interface UseImageUploadProps {
  selectedRequest: GenerationRequest | null;
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
      // Upload image to Supabase Storage
      const fileExt = resultImage.name.split('.').pop();
      const fileName = `${selectedRequest.id}-${Date.now()}.${fileExt}`;
      const filePath = `results/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('Generated Images')
        .upload(filePath, resultImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Generated Images')
        .getPublicUrl(filePath);

      // Update request with result URL and mark as completed
      const success = await updateGenerationRequestStatus(
        selectedRequest.id,
        'completed',
        publicUrl
      );
      
      if (success) {
        onRequestUpdated();
        clearInterval(interval);
        setUploadProgress(100);
        
        toast.success("Image uploaded and request completed!");
        
        const imageGeneratedEvent = new CustomEvent('imageGenerated', {
          detail: {
            imageUrl: publicUrl,
            prompt: selectedRequest.prompt,
            aspectRatio: selectedRequest.aspect_ratio,
            requestId: selectedRequest.id
          }
        });
        
        window.dispatchEvent(imageGeneratedEvent);
      } else {
        toast.error("Failed to update request with result image");
      }
      
    } catch (error) {
      console.error("Upload error:", error);
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
