
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple loading component
const SimpleLoading = () => (
  <div className="flex items-center justify-center text-gray-400 space-x-2 p-4">
    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
    <span>Loading...</span>
  </div>
);

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({
  imageUrl,
  prompt,
  onRetry
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Reset loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [imageUrl]);

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {hasError && (
          <Button
            onClick={onRetry}
            variant="ghost"
            className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6]"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>

      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center">
        {isLoading && imageUrl && (
          <SimpleLoading />
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={prompt || "Generated content"}
            className="max-w-full max-h-full object-contain rounded"
            style={{ display: isLoading ? 'none' : 'block' }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <div className="text-center text-gray-500">
            Image will appear here
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
