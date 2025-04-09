
import React from 'react';
import { Progress } from '@/components/ui/progress';
import CircularProgressIndicator from './CircularProgressIndicator';
import LoadingText from './LoadingText';

interface ImageLoadingStateProps {
  loadingProgress: number;
  setLoadingProgress?: React.Dispatch<React.SetStateAction<number>>;
}

const ImageLoadingState = ({ 
  loadingProgress, 
  setLoadingProgress 
}: ImageLoadingStateProps) => {
  const isLoading = loadingProgress > 0 && loadingProgress < 100;
  
  return (
    <div className="p-4 bg-gray-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-xs flex flex-col items-center">
        <CircularProgressIndicator 
          progress={loadingProgress} 
          size="medium"
          gradientId="imagePreviewGradient"
        />
        
        <div className="w-full max-w-[80%] space-y-2 mt-4">
          <div className="relative h-1.5 bg-gray-800/30 rounded-full overflow-hidden">
            <Progress 
              value={loadingProgress} 
              indicatorClassName="bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF]" 
              className="h-full" 
            />
          </div>
          <LoadingText isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ImageLoadingState;
