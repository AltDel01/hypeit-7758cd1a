
import React, { useRef } from 'react';
import ImageLoadingState from '@/components/ui/loading/ImageLoadingState';
import ImageErrorState from '../ImageErrorState';
import { useImageLoading } from '@/hooks/useImageLoading';

interface ImageDisplayProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
  isPlaceholder?: boolean;
}

const ImageDisplay = ({ imageUrl, prompt, onRetry, isPlaceholder = false }: ImageDisplayProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const {
    imageError,
    imageLoading,
    loadingProgress,
    retryCount,
    handleImageLoad,
    handleImageError,
    handleImageRetry
  } = useImageLoading({ imageUrl, prompt, onRetry });

  if ((imageLoading && imageUrl) || isPlaceholder) {
    return (
      <ImageLoadingState 
        loadingProgress={loadingProgress}
        setLoadingProgress={() => {}}
      />
    );
  } 
  
  if (imageError) {
    return <ImageErrorState onRetry={handleImageRetry} />;
  }
  
  if (imageUrl) {
    return (
      <img 
        ref={imageRef}
        key={`${imageUrl}-${retryCount}`} // Force re-render when URL changes or retry count increases
        src={imageUrl} 
        alt="Generated content" 
        className="w-full h-48 object-contain rounded"
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="eager"
        decoding="sync"
        crossOrigin="anonymous" // Help with CORS issues for some image sources
      />
    );
  }
  
  return null;
}

export default ImageDisplay;
