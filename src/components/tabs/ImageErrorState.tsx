
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

const ImageErrorState = ({ onRetry, message = "Failed to load image" }: ImageErrorStateProps) => {
  return (
    <div className="text-center p-4">
      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="mt-2 bg-[#8c52ff] hover:bg-[#7a45e6] text-xs flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Retry Loading
        </Button>
      )}
    </div>
  );
};

export default ImageErrorState;
