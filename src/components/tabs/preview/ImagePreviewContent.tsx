
import React from 'react';
import ImageLoadingState from '@/components/ui/loading/ImageLoadingState';
import ImageErrorState from '@/components/tabs/ImageErrorState';
import EmptyPreviewState from './EmptyPreviewState';

interface ImagePreviewContentProps {
  imageUrl: string | null;
  imageLoading: boolean;
  isPlaceholder: boolean;
  retryCount: number;
  loadingProgress: number;
  imageError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageLoad: () => void;
  handleImageError: () => void;
  handleImageRetry: () => void;
}

const ImagePreviewContent = ({
  imageUrl,
  imageLoading,
  isPlaceholder,
  retryCount,
  loadingProgress,
  imageError,
  imageRef,
  handleImageLoad,
  handleImageError,
  handleImageRetry
}: ImagePreviewContentProps) => {
  
  if ((imageLoading && imageUrl) || isPlaceholder) {
    return (
      <ImageLoadingState 
        loadingProgress={loadingProgress}
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
  
  return <EmptyPreviewState />;
};

export default ImagePreviewContent;
