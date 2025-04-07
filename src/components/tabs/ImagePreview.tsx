
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import ImageErrorState from './ImageErrorState';
import ImageLoadingState from '@/components/ui/loading/ImageLoadingState';
import { checkValidImageUrl } from '@/utils/image/imageValidation';

interface ImagePreviewProps {
  generatedImage: string | null;
  isLoading: boolean;
  aspectRatio: string;
}

const ImagePreview = ({ generatedImage, isLoading, aspectRatio }: ImagePreviewProps) => {
  const hasImage = checkValidImageUrl(generatedImage);
  
  // Convert aspectRatio string to a number for the AspectRatio component
  const ratio = aspectRatio === "9:16" ? 9 / 16 : 1;
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-300">
          Preview ({aspectRatio})
        </h3>
      </div>
      <div className="p-4">
        <div className={`w-full ${aspectRatio === "9:16" ? "max-w-[200px]" : "max-w-[300px]"} mx-auto`}>
          <AspectRatio ratio={ratio} className="overflow-hidden rounded-md">
            {isLoading ? (
              <ImageLoadingState />
            ) : hasImage ? (
              <img
                src={generatedImage || ''}
                alt="Generated content"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageErrorState message="No image generated yet" />
            )}
          </AspectRatio>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
