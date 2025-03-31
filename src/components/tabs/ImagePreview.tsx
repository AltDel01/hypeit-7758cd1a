
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

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

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Start animated progress
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          // Move progress to 90% during loading, the final 10% will complete when image loads
          const newProgress = prev + (90 - prev) * 0.1;
          return newProgress < 90 ? newProgress : 90;
        });
      }, 200);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
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
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    // Auto-retry once for Unsplash images
    if (imageUrl?.includes('unsplash.com') && retryCount === 0) {
      setTimeout(() => handleImageRetry(), 500);
    }
  };

  const handleImageRetry = () => {
    setRetryCount(prev => prev + 1);
    setImageLoading(true);
    onRetry();
  };

  if (!imageUrl) return null;

  return (
    <div className="mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {(imageError || retryCount > 0) && (
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
      <div className="p-2 bg-gray-800 min-h-[200px] flex items-center justify-center">
        {imageLoading && !imageError ? (
          <div className="animate-pulse flex flex-col items-center justify-center w-full space-y-4">
            <Skeleton className="h-32 w-32 rounded-md bg-gray-700/30" />
            <div className="w-full max-w-[80%] space-y-2">
              <Progress value={loadingProgress} className="h-1 bg-gray-700/30" />
              <p className="text-xs text-center text-gray-300">
                {loadingProgress < 100 ? 'Loading image...' : 'Processing complete'}
              </p>
            </div>
          </div>
        ) : imageError ? (
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-400">Failed to load image</p>
            <Button 
              onClick={handleImageRetry}
              className="mt-2 bg-[#8c52ff] hover:bg-[#7a45e6] text-xs flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry Loading
            </Button>
          </div>
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
