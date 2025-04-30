
import React, { useState, useEffect } from 'react';
import ImageGallery from '@/components/gallery/ImageGallery';
import { feedImages, storyImages } from '@/data/galleryImages';
import { useImageGenerationListener } from '@/hooks/useImageGenerationListener';

const ImageGallerySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Listen for tab changes from content section
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    
    window.addEventListener('tabChanged', handleTabChange as EventListener);
    
    return () => {
      window.removeEventListener('tabChanged', handleTabChange as EventListener);
    };
  }, []);
  
  // Listen for generated images
  useImageGenerationListener(setGeneratedImage);

  return (
    <ImageGallery 
      feedImages={feedImages}
      storyImages={storyImages}
      generatedImage={generatedImage}
      activeTab={activeTab}
    />
  );
};

export default ImageGallerySection;
