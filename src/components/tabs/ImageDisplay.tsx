
import React from 'react';

interface ImageDisplayProps {
  images: { src: string; alt: string }[];
  generatedImage: string | null;
  showGenerated: boolean;
  aspectRatio: 'square' | 'story';
}

const ImageDisplay = ({
  images,
  generatedImage,
  showGenerated,
  aspectRatio
}: ImageDisplayProps) => {
  // Set aspect ratio class based on the type
  const aspectRatioClass = aspectRatio === 'square' 
    ? 'aspect-square' 
    : 'aspect-[9/16]';

  return (
    <div className="grid grid-cols-2 gap-4">
      {showGenerated && generatedImage && (
        <div className="col-span-2 mb-4">
          <div className="border-2 border-purple-500 rounded-lg overflow-hidden">
            <div className="bg-purple-500 text-white text-xs px-3 py-1">
              Your Generated {aspectRatio === 'square' ? 'Feed' : 'Story'} Image
            </div>
            <div className={`w-full ${aspectRatioClass} relative`}>
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-full object-cover absolute top-0 left-0"
              />
            </div>
          </div>
        </div>
      )}
      
      {images.map((image, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
          <div className={`w-full ${aspectRatioClass} relative`}>
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageDisplay;
