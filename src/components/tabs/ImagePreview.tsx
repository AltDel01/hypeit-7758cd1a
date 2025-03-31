
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({ imageUrl, prompt, onRetry }: ImagePreviewProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageError(false);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
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
          <div className="animate-pulse flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-[#8c52ff]/30 mb-2"></div>
            <p className="text-xs text-gray-300">Loading image...</p>
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
