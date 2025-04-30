
import { useState, useEffect } from 'react';

export const useImageGenerationListener = (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("useImageGenerationListener caught event:", event.detail);
      if (event.detail && event.detail.imageUrl) {
        setImage(event.detail.imageUrl);
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, [setImage]);
};
