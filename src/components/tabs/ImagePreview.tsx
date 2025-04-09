
import React from 'react';
import PreviewHeader from './preview/PreviewHeader';
import ImagePreviewContent from './preview/ImagePreviewContent';
import { useImagePreview } from './preview/useImagePreview';

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

const ImagePreview = ({ imageUrl, prompt, onRetry }: ImagePreviewProps) => {
  const {
    imageError,
    imageLoading,
    retryCount,
    loadingProgress,
    isPlaceholder,
    imageRef,
    handleImageLoad,
    handleImageError,
    handleImageRetry
  } = useImagePreview({ imageUrl, prompt, onRetry });

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <PreviewHeader
        retryCount={retryCount}
        loadingProgress={loadingProgress}
        imageLoading={imageLoading}
        imageUrl={imageUrl}
        imageError={imageError}
        onRetry={handleImageRetry}
      />
      
      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center">
        <ImagePreviewContent
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          isPlaceholder={isPlaceholder}
          retryCount={retryCount}
          loadingProgress={loadingProgress}
          imageError={imageError}
          imageRef={imageRef}
          handleImageLoad={handleImageLoad}
          handleImageError={handleImageError}
          handleImageRetry={handleImageRetry}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
