
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({ imageUrl, prompt, onRetry }: ImagePreviewProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageRetry = () => {
    onRetry();
  };

  if (!imageUrl) return null;

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {imageError && (
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
        {imageLoading && !imageError ? (
          <div className="text-center p-4">
            <div className="animate-pulse flex space-x-2 justify-center mb-2">
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
            </div>
            <p className="text-sm text-gray-400">Loading image...</p>
          </div>
        ) : imageError ? (
          <div className="text-center text-red-400">
            <p>Failed to load image</p>
            <Button onClick={handleImageRetry} variant="outline" size="sm" className="mt-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt="Generated content" 
            className="w-full h-auto max-h-[300px] object-contain rounded"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
