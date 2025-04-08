
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
    <div className="col-span-7 grid grid-cols-12 gap-4 h-screen">
      <div className="col-span-6 p-4 overflow-hidden max-h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ImageDisplay 
            images={feedImages}
            generatedImage={generatedImage}
            showGenerated={activeTab === "feed"}
            aspectRatio="square"
          />
        </div>
      </div>
      
      <div className="col-span-6 p-4 overflow-hidden max-h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ImageDisplay 
            images={storyImages}
            generatedImage={generatedImage}
            showGenerated={activeTab === "story"}
            aspectRatio="story"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
