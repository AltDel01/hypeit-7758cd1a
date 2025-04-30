
import * as Sentry from '@sentry/react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { imageRequestService } from '@/services/requests';

export const useImageGenerator = (
  prompt: string,
  productImage: File | null,
  user: any,
  activeTab: string,
  setIsGenerating: (isGenerating: boolean) => void
) => {
  const navigate = useNavigate();

  return async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    if (!user) {
      toast.error("Please log in to generate images");
      localStorage.setItem('authRedirectPath', '/');
      localStorage.setItem('savedPrompt', prompt);
      return;
    }
    
    setIsGenerating(true);
    try {
      const aspectRatio = activeTab === "feed" ? "1:1" : "9:16";
      console.log(`Generating image with aspect ratio: ${aspectRatio}`);
      console.log(`Product image available: ${productImage !== null}`);
      
      let productImageUrl = null;
      
      if (productImage) {
        console.log(`Product image: ${productImage.name}, size: ${productImage.size}`);
        productImageUrl = URL.createObjectURL(productImage);
      }
      
      Sentry.setContext("image_generation", {
        prompt: prompt,
        aspectRatio: aspectRatio,
        hasProductImage: productImage !== null,
        timestamp: new Date().toISOString()
      });
      
      // Get the batch size from local storage (set by VisualSettings)
      const batchSize = parseInt(localStorage.getItem('selectedImagesPerBatch') || '1', 10);
      const isPremiumBatch = batchSize > 3;
      
      // Create request in the service
      const request = imageRequestService.createRequest(
        user.id,
        user.email || 'Anonymous User',
        prompt,
        aspectRatio,
        productImageUrl,
        batchSize
      );
      
      console.log("Image generation request created:", request);
      
      // Start progress simulation for user feedback
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) {
          progress = 95;
          clearInterval(interval);
        }
        
        const progressEvent = new CustomEvent('imageGenerationProgress', {
          detail: { progress, requestId: request.id }
        });
        window.dispatchEvent(progressEvent);
      }, 800);
      
      // For premium batches (15 or 25 images), immediately navigate to Analytics > Generated Content
      if (isPremiumBatch) {
        // Show toast notification before redirecting
        toast.success("Generating your batch of images...");
        
        navigate('/analytics');
        
        // Add a small delay to allow the page to load before setting the active section
        setTimeout(() => {
          const event = new CustomEvent('setAnalyticsSection', { 
            detail: { section: 'generated' } 
          });
          window.dispatchEvent(event);
        }, 500);
      } else {
        // For regular batches (1 or 3 images), stay on homepage and show the generated image
        toast.success("Your image generation request has been sent to our designers!");
        toast.info("You'll receive a notification when your image is ready.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Sentry.captureException(error);
      toast.error(`Failed to submit request: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
    }
  };
};
