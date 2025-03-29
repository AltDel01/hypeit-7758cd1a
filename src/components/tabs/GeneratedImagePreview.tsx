
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from "sonner";

interface GeneratedImagePreviewProps {
  imageUrl: string;
  aspectRatio: "square" | "story";
}

const GeneratedImagePreview = ({ imageUrl, aspectRatio }: GeneratedImagePreviewProps) => {
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
      <img 
        src={imageUrl} 
        alt="Generated AI image" 
        className={`w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[9/16]"} object-cover`} 
      />
      <div className="absolute bottom-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/70 text-white rounded-full h-8 w-8 p-0 mr-2"
          onClick={handleCopy}
        >
          <Copy size={14} />
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/70 text-white rounded-full h-8 w-8 p-0"
          onClick={handleDownload}
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
