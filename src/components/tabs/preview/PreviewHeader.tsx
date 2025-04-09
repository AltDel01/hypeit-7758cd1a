
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewHeaderProps {
  retryCount: number;
  loadingProgress: number;
  imageLoading: boolean;
  imageUrl: string | null;
  imageError: boolean;
  onRetry: () => void;
}

const PreviewHeader = ({ 
  retryCount, 
  loadingProgress, 
  imageLoading, 
  imageUrl, 
  imageError,
  onRetry 
}: PreviewHeaderProps) => {
  const showRetryButton = imageError || retryCount > 0 || (loadingProgress > 90 && imageLoading) || imageUrl;
  
  return (
    <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
      <span>Generated Image</span>
      {showRetryButton && (
        <Button 
          onClick={onRetry} 
          variant="ghost" 
          className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6] flex items-center"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${imageLoading ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      )}
    </div>
  );
};

export default PreviewHeader;
