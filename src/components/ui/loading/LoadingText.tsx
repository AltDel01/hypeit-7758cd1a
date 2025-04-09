
import React, { useEffect, useRef, useState } from 'react';

interface LoadingTextProps {
  isLoading: boolean;
}

const LoadingText = ({ isLoading }: LoadingTextProps) => {
  const [processingText, setProcessingText] = useState<string>("Loading image...");
  const [processingDetail, setProcessingDetail] = useState<string>("");
  const progressTextIntervalRef = useRef<number | null>(null);
  const detailIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only start the processing text rotation if we're actually loading something
    if (isLoading) {
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
      if (!isLoading) {
        setProcessingText(isLoading === undefined ? "Ready to generate image" : "Image generation complete");
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
  }, [isLoading]);
  
  return (
    <div className="w-full max-w-[80%] space-y-2 mt-4">
      <p className="text-sm text-center text-gray-300">
        {processingText}
      </p>
      {processingDetail && isLoading && (
        <p className="text-xs text-center text-gray-500 mt-2 max-w-[280px] mx-auto">
          {processingDetail}
        </p>
      )}
    </div>
  );
};

export default LoadingText;
