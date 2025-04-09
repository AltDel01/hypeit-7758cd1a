
import React, { useState, useEffect } from 'react';
import { forceImageGenerationRetry } from '@/utils/image/imageEvents';
import ImageRetryButton from './image/ImageRetryButton';
import ImageDisplay from './image/ImageDisplay';
import NoImagePlaceholder from './image/NoImagePlaceholder';

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({ imageUrl, prompt, onRetry }: ImagePreviewProps) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Listen for image generation retry events
  useEffect(() => {
    const handleRetryEvent = () => {
      console.log("ImagePreview received retry event");
      handleImageRetry();
    };
    
    window.addEventListener('retryImageGeneration', handleRetryEvent);
    
    return () => {
      window.removeEventListener('retryImageGeneration', handleRetryEvent);
    };
  }, []);

  const handleImageRetry = () => {
    console.log("Handling image retry from ImagePreview");
    setRetryCount(prev => prev + 1);
    setLoadingProgress(0);
    
    // Call the onRetry callback
    onRetry();
    
    // Also trigger a retry through the event system to ensure all components are aware
    if (prompt) {
      forceImageGenerationRetry(prompt);
    }
  };

  const isPlaceholder = imageUrl?.includes('placeholder.com') || imageUrl?.includes('Generating+Image');
  const showRetryButton = retryCount > 0 || (loadingProgress > 90) || imageUrl;

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {showRetryButton && (
          <ImageRetryButton 
            onRetry={handleImageRetry} 
            isLoading={isPlaceholder}
          />
        )}
      </div>
      
      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center">
        {imageUrl ? (
          <ImageDisplay 
            imageUrl={imageUrl} 
            prompt={prompt} 
            onRetry={onRetry}
            isPlaceholder={isPlaceholder}
          />
        ) : (
          <NoImagePlaceholder />
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
