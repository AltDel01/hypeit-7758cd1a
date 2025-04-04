
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
  const [isStalled, setIsStalled] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  const stalledTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(false);
      setImageError(false);
      setIsStalled(false);
      
      // Start animated progress
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
      }
      
      // Set a hard timeout for loading
      loadingTimeoutRef.current = window.setTimeout(() => {
        console.log("Hard loading timeout reached, triggering retry");
        handleImageRetry();
      }, 60000); // 60 seconds maximum total loading time
      
      // Realistic progress animation
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          // Simulate natural progress curve
          if (prev < 20) return prev + 1;
          if (prev < 50) return prev + 0.5;
          if (prev < 80) return prev + 0.2;
          if (prev < 90) return prev + 0.1;
          
          // When progress reaches 90%, start stall detection timer
          if (prev >= 90 && !isStalled && stalledTimerRef.current === null) {
            console.log("Progress at 90+%, starting stall detection timer");
            stalledTimerRef.current = window.setTimeout(() => {
              console.log("Image generation appears stalled at 90+%");
              setIsStalled(true);
            }, 12000); // 12 seconds at 90% is considered stalled
          }
          
          // Force timeout if stuck at 90+ for too long
          if (prev >= 90 && timeoutRef.current === null) {
            console.log("Progress stuck at 90+%, setting timeout");
            timeoutRef.current = window.setTimeout(() => {
              console.log("Loading timeout reached, forcing retry");
              handleImageRetry();
            }, 15000); // 15 seconds timeout if stuck at high percentage
          }
          
          return prev < 95 ? prev + 0.05 : prev;
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
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
        stalledTimerRef.current = null;
      }
    };
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageError(false);
    setImageLoading(false);
    setIsStalled(false);
    setLoadingProgress(100);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (stalledTimerRef.current) {
      window.clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = null;
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
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (stalledTimerRef.current) {
      window.clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = null;
    }
    
    // Auto-retry once for images
    if (retryCount === 0) {
      setTimeout(() => handleImageRetry(), 1000);
    }
  };

  const handleImageRetry = () => {
    console.log("Handling image retry");
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (stalledTimerRef.current) {
      window.clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = null;
    }
    
    setRetryCount(prev => prev + 1);
    setLoadingProgress(0);
    setImageLoading(true);
    setImageError(false);
    setIsStalled(false);
    onRetry();
  };

  const isPlaceholder = 
    imageUrl?.includes('placeholder.com') || 
    imageUrl?.includes('Generating+Image');

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {(imageError || isStalled || retryCount > 0 || loadingProgress > 90) && (
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
            isStalled={isStalled}
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
