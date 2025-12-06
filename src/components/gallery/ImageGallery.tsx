
import React from 'react';
import ImageDisplay from '../tabs/ImageDisplay';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface ImageGalleryProps {
  feedImages: { src: string; alt: string }[];
  storyImages: { src: string; alt: string }[];
  generatedImage: string | null;
  activeTab: string;
}

const ImageGallery = ({ feedImages, storyImages, generatedImage, activeTab }: ImageGalleryProps) => {
  console.log("🖼️  ImageGallery render:", {
    activeTab,
    hasGeneratedImage: !!generatedImage,
    generatedImagePreview: generatedImage?.substring(0, 100),
    feedShowGenerated: activeTab === "feed",
    storyShowGenerated: activeTab === "story"
  });

  return (
    <div className="col-span-7 grid grid-cols-12 gap-0 h-screen">
      <div className="col-span-6 p-4 overflow-hidden max-h-screen">
        <ImageDisplay 
          images={feedImages}
          generatedImage={generatedImage}
          showGenerated={activeTab === "feed"}
          aspectRatio="square"
        />
      </div>
      
      <div className="col-span-6 p-4 overflow-hidden max-h-screen">
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
