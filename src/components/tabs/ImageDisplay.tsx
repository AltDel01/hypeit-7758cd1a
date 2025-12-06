
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
    console.log(`📺 ImageDisplay (${aspectRatio}) - generatedImage prop updated:`, generatedImage);
    setLocalGeneratedImage(generatedImage);
  }, [generatedImage, aspectRatio]);
  
  // Listen for generated image events
  useEffect(() => {
    // Listen for the imageGenerated event
    const handleImageGenerated = (event: CustomEvent) => {
      console.log(`📺 ImageDisplay (${aspectRatio}) caught generated event:`, event.detail);
      
      if (showGenerated) {
        console.log(`✅ ImageDisplay (${aspectRatio}) setting image:`, event.detail.imageUrl?.substring(0, 100));
        setLocalGeneratedImage(event.detail.imageUrl);
      } else {
        console.log(`⏭️  ImageDisplay (${aspectRatio}) skipping - showGenerated is false`);
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    console.log(`🎧 ImageDisplay (${aspectRatio}) event listener registered, showGenerated:`, showGenerated);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, [showGenerated, aspectRatio]);
  
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

  // Filter out placeholder images - but do it efficiently
  const filteredImages = React.useMemo(() => {
    return images.filter(image => {
      return !image.src.includes('placeholder') && 
             !image.src.includes('unsplash') &&
             !image.src.includes('Generating+Image');
    });
  }, [images]);

  // Show generated image when available and showGenerated flag is true
  const shouldShowGeneratedImage = showGenerated && localGeneratedImage;
  
  console.log(`🎬 ImageDisplay (${aspectRatio}) render state:`, {
    showGenerated,
    hasLocalImage: !!localGeneratedImage,
    shouldShow: shouldShowGeneratedImage,
    imagePreview: localGeneratedImage?.substring(0, 80)
  });

  return (
    <div className={`grid grid-cols-1 gap-5 ${aspectRatio === "square" ? "animate-feed-scroll-down" : "animate-story-scroll-up"} scrollbar-hide`}>
      {shouldShowGeneratedImage && (
        <div className="rounded-lg overflow-hidden relative group mb-5 border-2 border-[#9b87f5]">
          <img 
            src={localGeneratedImage} 
            alt="Generated AI image" 
            className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
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
      )}
      
      {filteredImages.map((image, index) => (
        <div key={`${index}-${image.src}`} className="rounded-lg overflow-hidden relative group">
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
  );
};

export default ImageDisplay;
