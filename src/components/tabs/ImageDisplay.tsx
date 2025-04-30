

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from "sonner";

interface ImageDisplayProps {
  images: { src: string; alt: string }[];
  generatedImage: string | null;
  showGenerated: boolean;
  aspectRatio: "square" | "story";
}

const ImageDisplay = ({ images, generatedImage, showGenerated, aspectRatio }: ImageDisplayProps) => {
  const [localGeneratedImage, setLocalGeneratedImage] = useState<string | null>(generatedImage);
  
  // Update when prop changes
  useEffect(() => {
    console.log("ImageDisplay - generatedImage prop updated:", generatedImage);
    setLocalGeneratedImage(generatedImage);
  }, [generatedImage]);
  
  // Listen for generated image events
  useEffect(() => {
    // Listen for the imageGenerated event
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("Image display caught generated event:", event.detail);
      
      if (showGenerated) {
        setLocalGeneratedImage(event.detail.imageUrl);
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, [showGenerated]);
  
  const handleDownload = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `generated-${aspectRatio === "square" ? "image" : "story"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded");
  };

  const handleCopy = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl)
      .then(() => toast.success("Image URL copied to clipboard"))
      .catch(err => toast.error("Failed to copy URL: " + err.message));
  };

  // Create enough copies of images for smooth infinite scrolling
  const displayImages = [...images, ...images];
  
  // Create duplicated content for seamless scrolling
  const contentTop = [...displayImages];
  const contentBottom = [...displayImages];

  // Set appropriate animation class based on aspect ratio
  const animationClass = aspectRatio === "square" ? "animate-feed-scroll-down" : "animate-story-scroll-up";

  return (
    <div className="scroll-container">
      {/* First set of images */}
      <div className={`scroll-content ${animationClass}`}>
        {localGeneratedImage && showGenerated ? (
          <div className="rounded-lg overflow-hidden relative group mb-4 border-2 border-[#9b87f5]">
            <img 
              src={localGeneratedImage} 
              alt="Generated AI image" 
              className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`}
              loading="eager"
            />
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
                onClick={() => handleCopy(localGeneratedImage)}
              >
                <Copy size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
                onClick={() => handleDownload(localGeneratedImage)}
              >
                <Download size={14} />
              </Button>
            </div>
            <div className="absolute top-0 left-0 bg-[#9b87f5] text-white px-2 py-1 text-xs">
              Generated Image
            </div>
          </div>
        ) : null}
        
        {contentTop.map((image, index) => (
          <div key={`top-${index}-${image.src}`} className="rounded-lg overflow-hidden relative group mb-4">
            <img 
              src={image.src} 
              alt={image.alt} 
              className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`}
              loading={index < 4 ? "eager" : "lazy"}
            />
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
                onClick={() => handleCopy(image.src)}
              >
                <Copy size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
                onClick={() => handleDownload(image.src)}
              >
                <Download size={14} />
              </Button>
            </div>
          </div>
        ))}
        
        {contentBottom.map((image, index) => (
          <div key={`bottom-${index}-${image.src}`} className="rounded-lg overflow-hidden relative group mb-4">
            <img 
              src={image.src} 
              alt={image.alt} 
              className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`}
              loading="lazy"
            />
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
                onClick={() => handleCopy(image.src)}
              >
                <Copy size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
                onClick={() => handleDownload(image.src)}
              >
                <Download size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDisplay;

