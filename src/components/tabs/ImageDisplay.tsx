
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from "sonner";

interface ImageDisplayProps {
  images: { src: string; alt: string }[];
  generatedImage: string | null;
  showGenerated: boolean;
  aspectRatio: "square" | "story";
}

const ImageDisplay = ({ images, generatedImage, showGenerated, aspectRatio }: ImageDisplayProps) => {
  const handleDownload = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `generated-${aspectRatio === "square" ? "image" : "story"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded");
  };

  return (
    <div className="grid grid-cols-1 gap-5 animate-feed-scroll scrollbar-hide">
      {generatedImage && showGenerated ? (
        <div className="rounded-lg overflow-hidden relative group mb-5">
          <img 
            src={generatedImage} 
            alt="Generated AI image" 
            className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
          />
          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
              onClick={() => handleDownload(generatedImage)}
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
      ) : null}
      {images.map((image, index) => (
        <div key={index} className="rounded-lg overflow-hidden relative group">
          <img 
            src={image.src} 
            alt={image.alt} 
            className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
          />
          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="bg-black/70 text-white rounded-full h-8 w-8 p-0">
              <Copy size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageDisplay;
