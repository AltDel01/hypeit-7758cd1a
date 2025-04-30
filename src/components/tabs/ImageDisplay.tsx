
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from "sonner";

interface ImageDisplayProps {
  images: { src: string; alt: string }[];
  generatedImage: string | null;
  showGenerated: boolean;
  aspectRatio: "square" | "story";
}

const ImageDisplay = ({ images, aspectRatio }: ImageDisplayProps) => {
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

  // Create duplicated content for seamless scrolling
  const displayImages = [...images, ...images];

  // Set appropriate animation class based on aspect ratio
  const animationClass = aspectRatio === "square" ? "animate-feed-scroll-down" : "animate-story-scroll-up";

  return (
    <div className="scroll-container">
      <div className={`scroll-content ${animationClass} hardware-accelerated`}>
        {displayImages.map((image, index) => (
          <div key={`${index}-${image.src}`} className="rounded-lg overflow-hidden relative group mb-4">
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
      </div>
    </div>
  );
};

export default ImageDisplay;
