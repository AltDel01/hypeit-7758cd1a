
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
  const [processingText, setProcessingText] = useState<string>("Loading image...");
  const [processingDetail, setProcessingDetail] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const progressTextIntervalRef = useRef<number | null>(null);
  const detailIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Start animated progress
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Realistic progress animation
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 20) return prev + 1;
          if (prev < 50) return prev + 0.5;
          if (prev < 80) return prev + 0.2;
          if (prev < 90) return prev + 0.1;
          return prev;
        });
      }, 300);
      
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
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (progressTextIntervalRef.current) {
        window.clearInterval(progressTextIntervalRef.current);
      }
      if (detailIntervalRef.current) {
        window.clearInterval(detailIntervalRef.current);
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
    if (progressTextIntervalRef.current) {
      window.clearInterval(progressTextIntervalRef.current);
    }
    if (detailIntervalRef.current) {
      window.clearInterval(detailIntervalRef.current);
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (progressTextIntervalRef.current) {
      window.clearInterval(progressTextIntervalRef.current);
    }
    if (detailIntervalRef.current) {
      window.clearInterval(detailIntervalRef.current);
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

  const isPlaceholder = imageUrl?.includes('placeholder.com') || imageUrl?.includes('Generating+Image');

  if (!imageUrl) return null;

  // Only show the loading state when image is loading or is a placeholder
  if ((imageLoading || isPlaceholder) && !imageError) {
    return (
      <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
        <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
          <span>Generated Image</span>
        </div>
        <div className="p-4 bg-gray-900 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs flex flex-col items-center">
            <div className="relative h-20 w-20 mb-4">
              <svg className="animate-spin h-full w-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="imagePreviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9b87f5" />
                    <stop offset="50%" stopColor="#8c52ff" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                  <filter id="imagePreviewGlow">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle 
                  className="opacity-10" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="#ffffff" 
                  strokeWidth="8" 
                  fill="none" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="url(#imagePreviewGradient)" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 * (1 - loadingProgress / 100)} 
                  filter="url(#imagePreviewGlow)"
                  className="drop-shadow-[0_0_8px_rgba(140,82,255,0.8)]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{Math.round(loadingProgress)}%</span>
              </div>
            </div>
            
            <div className="w-full max-w-[80%] space-y-2">
              <div className="relative h-1.5 bg-gray-800/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF] rounded-full transition-all"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-300">
                {processingText}
              </p>
              <p className="text-xs text-center text-gray-500 mt-2 max-w-[280px] mx-auto">
                {processingDetail || "Enhancing details..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center">
        {imageError ? (
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
