
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

  // Only show generated image if we have one AND showGenerated is true
  const shouldShowGeneratedImage = Boolean(localGeneratedImage && showGenerated);

  return (
    <div className={`grid grid-cols-1 gap-5 ${aspectRatio === "square" ? "animate-fade-in" : "animate-fade-in"} scrollbar-hide`}>
      {shouldShowGeneratedImage && (
        <div className="rounded-lg overflow-hidden relative group mb-5 border-2 border-[#9b87f5]">
          <img 
            src={localGeneratedImage!} 
            alt="Generated AI image" 
            className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
          />
          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
              onClick={() => handleCopy(localGeneratedImage!)}
            >
              <Copy size={14} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
              onClick={() => handleDownload(localGeneratedImage!)}
            >
              <Download size={14} />
            </Button>
          </div>
          <div className="absolute top-0 left-0 bg-[#9b87f5] text-white px-2 py-1 text-xs">
            Generated Image
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center p-8 bg-gray-900/70 rounded-lg border border-gray-800">
        <p className="text-gray-400 text-center">
          Image generation functionality is currently disabled.
          <br />
          <span className="text-sm text-gray-500">Please check back later when this feature is ready.</span>
        </p>
      </div>
    </div>
  );
};

export default ImageDisplay;
