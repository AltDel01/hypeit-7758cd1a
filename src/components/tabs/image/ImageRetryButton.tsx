
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageRetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
}

const ImageRetryButton = ({ onRetry, isLoading }: ImageRetryButtonProps) => {
  return (
    <Button 
      onClick={onRetry} 
      variant="ghost" 
      className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6] flex items-center"
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
      Retry
    </Button>
  );
};

export default ImageRetryButton;
