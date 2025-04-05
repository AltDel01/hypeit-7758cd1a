import React from 'react'; // Hanya perlu React
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from "sonner";

interface ImageDisplayProps {
  images: { src: string; alt: string }[];
  aspectRatio: "square" | "story"; // Hanya perlu props ini
}

const ImageDisplay = ({ images, aspectRatio }: ImageDisplayProps) => { // Hanya images & aspectRatio

  // Fungsi utilitas handleDownload dan handleCopy tetap berguna untuk list
  const handleDownload = (imageUrl: string) => { /* ... implementasi ... */ };
  const handleCopy = (imageUrl: string) => { /* ... implementasi ... */ };

  // Kelas animasi dan penggandaan gambar tetap sama
  const animationClass = aspectRatio === "square" ? "animate-feed-scroll-down" : "animate-story-scroll-up";
  const displayImages = [...images, /* ... penggandaan ... */];

  return (
    <div className={`grid grid-cols-1 gap-5 ${animationClass} scrollbar-hide`}>
      {/* Hanya render list gambar */}
      {displayImages.map((image, index) => (
        <div key={`${index}-${image.src}`} className="rounded-lg overflow-hidden relative group">
          <img /* ... */ />
          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={() => handleCopy(image.src)} /* ... */ > <Copy size={14} /> </Button>
            <Button onClick={() => handleDownload(image.src)} /* ... */ > <Download size={14} /> </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageDisplay;