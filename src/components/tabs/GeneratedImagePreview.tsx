
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, AlertCircle } from 'lucide-react';
import { toast } from "sonner";

interface GeneratedImagePreviewProps {
  imageUrl: string;
  aspectRatio: "square" | "story";
}

const GeneratedImagePreview = ({ imageUrl, aspectRatio }: GeneratedImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);

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

  return (
    <div className="rounded-lg overflow-hidden relative group border-4 border-blue-500 shadow-lg">
      {imageUrl && !imageError ? (
        <img 
          src={imageUrl} 
          alt="Generated AI image" 
          className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
          onError={(e) => {
            console.error("Error loading image:", imageUrl);
            setImageError(true);
          }}
        />
      ) : (
        <div className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} bg-gray-700 flex flex-col items-center justify-center p-4`}>
          {imageError ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-white text-sm text-center mb-1">Image failed to load</p>
              <p className="text-gray-400 text-xs text-center">There was an error generating or displaying the image</p>
            </>
          ) : (
            <p className="text-white text-sm">No image generated</p>
          )}
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
