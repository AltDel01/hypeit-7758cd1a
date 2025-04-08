
import React, { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import CircularProgressIndicator from './CircularProgressIndicator';

interface ImageLoadingStateProps {
  loadingProgress: number;
  setLoadingProgress?: React.Dispatch<React.SetStateAction<number>>;
}

const ImageLoadingState = ({ 
  loadingProgress, 
  setLoadingProgress 
}: ImageLoadingStateProps) => {
  const [processingText, setProcessingText] = useState<string>("Loading image...");
  const [processingDetail, setProcessingDetail] = useState<string>("");
  const progressTextIntervalRef = useRef<number | null>(null);
  const detailIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only start the processing text rotation if we're actually loading something
    if (loadingProgress > 0 && loadingProgress < 100) {
      // Rotating processing text
      const processingTexts = [
        "Loading image...",
        "Analyzing content...",
        "Applying style...",
        "Enhancing details...",
        "Finalizing image..."
      ];
      
      // Processing detail text
      const detailTexts = [
        "Analyzing image structure...",
        "Processing visual elements...",
        "Optimizing for quality...",
        "Our AI is carefully transforming your image. This typically takes around 60 seconds to ensure the highest quality results."
      ];
      
      let textIndex = 0;
      let detailIndex = 0;
      
      if (progressTextIntervalRef.current) {
        window.clearInterval(progressTextIntervalRef.current);
      }
      
      if (detailIntervalRef.current) {
        window.clearInterval(detailIntervalRef.current);
      }
      
      progressTextIntervalRef.current = window.setInterval(() => {
        textIndex = (textIndex + 1) % processingTexts.length;
        setProcessingText(processingTexts[textIndex]);
      }, 3000);
      
      detailIntervalRef.current = window.setInterval(() => {
        detailIndex = (detailIndex + 1) % detailTexts.length;
        setProcessingDetail(detailTexts[detailIndex]);
      }, 5000);
    } else {
      // If we're not actually loading, clear intervals and reset text
      if (progressTextIntervalRef.current) {
        window.clearInterval(progressTextIntervalRef.current);
        progressTextIntervalRef.current = null;
      }
      
      if (detailIntervalRef.current) {
        window.clearInterval(detailIntervalRef.current);
        detailIntervalRef.current = null;
      }
      
      // Reset to default text if not actively loading
      if (loadingProgress === 0) {
        setProcessingText("Ready to generate image");
        setProcessingDetail("");
      } else if (loadingProgress === 100) {
        setProcessingText("Image generation complete");
        setProcessingDetail("");
      }
    }
    
    return () => {
      if (progressTextIntervalRef.current) {
        window.clearInterval(progressTextIntervalRef.current);
      }
      if (detailIntervalRef.current) {
        window.clearInterval(detailIntervalRef.current);
      }
    };
  }, [loadingProgress]);
  
  // Don't show loading UI if there's no progress
  if (loadingProgress <= 0) {
    return null;
  }
  
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
          <p className="text-sm text-center text-gray-300">
            {processingText}
          </p>
          {processingDetail && loadingProgress > 0 && loadingProgress < 100 && (
            <p className="text-xs text-center text-gray-500 mt-2 max-w-[280px] mx-auto">
              {processingDetail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLoadingState;
