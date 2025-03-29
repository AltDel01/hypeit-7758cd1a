
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface GeneratedImagePreviewProps {
  imageUrl: string;
  aspectRatio: "square" | "story";
}

const GeneratedImagePreview = ({ imageUrl, aspectRatio }: GeneratedImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `generated-${aspectRatio === "square" ? "image" : "story"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl)
      .then(() => toast.success("Image URL copied to clipboard"))
      .catch(err => toast.error("Failed to copy URL: " + err.message));
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error("Error loading image:", imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="rounded-lg overflow-hidden relative group border-4 border-blue-500 shadow-lg">
      {imageUrl ? (
        <>
          <img 
            src={imageUrl} 
            alt="Generated AI image" 
            className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover ${(imageLoading || imageError) ? 'hidden' : 'block'}`} 
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {imageLoading && !imageError && (
            <div className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} bg-gray-800 flex flex-col items-center justify-center p-4`}>
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-white text-sm text-center">Loading image...</p>
            </div>
          )}
          
          {imageError && (
            <div className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} bg-gray-800 flex flex-col items-center justify-center p-4`}>
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <p className="text-white text-sm text-center font-medium mb-2">Image failed to load</p>
              <p className="text-gray-400 text-xs text-center max-w-xs">There was an error generating or displaying the image. Please try again with a different prompt.</p>
            </div>
          )}
        </>
      ) : (
        <div className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} bg-gray-800 flex flex-col items-center justify-center p-4`}>
          <p className="text-white text-sm">No image generated</p>
        </div>
      )}
      
      <div className="absolute bottom-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
          onClick={handleCopy}
          disabled={!imageUrl || imageError}
        >
          <Copy size={14} />
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
          onClick={handleDownload}
          disabled={!imageUrl || imageError}
        >
          <Download size={14} />
        </Button>
      </div>
      <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-sm font-bold">
        Generated Image
      </div>
    </div>
  );
};

export default GeneratedImagePreview;
