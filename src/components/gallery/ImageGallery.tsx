
import React from 'react';
import ImageDisplay from '../tabs/ImageDisplay';

interface ImageGalleryProps {
  feedImages: { src: string; alt: string }[];
  storyImages: { src: string; alt: string }[];
  generatedImage: string | null;
  activeTab: string;
}

const ImageGallery = ({ feedImages, storyImages, generatedImage, activeTab }: ImageGalleryProps) => {
  return (
    <div className="col-span-7 grid grid-cols-12 gap-4 h-[calc(100vh-64px)] overflow-hidden">
      <div className="col-span-6 p-4 overflow-auto max-h-full">
        <ImageDisplay 
          images={feedImages}
          generatedImage={generatedImage}
          showGenerated={activeTab === "feed"}
          aspectRatio="square"
        />
      </div>
      
      <div className="col-span-6 p-4 overflow-auto max-h-full">
        <ImageDisplay 
          images={storyImages}
          generatedImage={generatedImage}
          showGenerated={activeTab === "story"}
          aspectRatio="story"
        />
      </div>
    </div>
  );
};

export default ImageGallery;
