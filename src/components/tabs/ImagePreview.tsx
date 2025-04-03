
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageLoadingState from '@/components/ui/loading/ImageLoadingState';
import ImageErrorState from './ImageErrorState';

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({ imageUrl, prompt, onRetry }: ImagePreviewProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Start animated progress
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Realistic progress animation
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 20) return prev + 1;
          if (prev < 50) return prev + 0.5;
          if (prev < 80) return prev + 0.2;
          if (prev < 90) return prev + 0.1;
          if (prev >= 95) {
            // If stuck at high percentage for too long, force completion or show error
            if (timeoutRef.current === null) {
              timeoutRef.current = window.setTimeout(() => {
                console.log("Loading timeout reached, forcing retry");
                handleImageRetry();
              }, 15000); // 15 seconds timeout if stuck at high percentage
            }
          }
          return prev;
        });
      }, 300);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageError(false);
    setImageLoading(false);
    setLoadingProgress(100);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Auto-retry once for Unsplash images
    if (imageUrl?.includes('unsplash.com') && retryCount === 0) {
      setTimeout(() => handleImageRetry(), 500);
    }
  };

  const handleImageRetry = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRetryCount(prev => prev + 1);
    setImageLoading(true);
    onRetry();
  };

  const isPlaceholder = imageUrl?.includes('placeholder.com') || imageUrl?.includes('Generating+Image');

  // Set up a global timeout to ensure we don't get stuck perpetually
  useEffect(() => {
    const globalTimeout = window.setTimeout(() => {
      if (imageLoading && loadingProgress >= 90) {
        console.log("Global timeout reached for image loading");
        handleImageRetry();
      }
    }, 30000); // 30 seconds max loading time
    
    return () => {
      window.clearTimeout(globalTimeout);
    };
  }, [imageLoading, loadingProgress]);

  if (!imageUrl) return null;

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {(imageError || retryCount > 0 || loadingProgress > 90) && (
          <Button 
            onClick={handleImageRetry} 
            variant="ghost" 
            className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6] flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
      
      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center">
        {(imageLoading || isPlaceholder) && !imageError ? (
          <ImageLoadingState 
            loadingProgress={loadingProgress}
            setLoadingProgress={setLoadingProgress}
          />
        ) : imageError ? (
          <ImageErrorState onRetry={handleImageRetry} />
        ) : (
          <img 
            ref={imageRef}
            key={`${imageUrl}-${retryCount}`} // Force re-render when URL changes or retry count increases
            src={imageUrl} 
            alt="Generated content" 
            className="w-full h-48 object-contain rounded"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
