
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Upload, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  className?: string;
}

const ImageUploader = ({ productImage, setProductImage, className }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("File selected:", file.name);
      setProductImage(file);
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        console.log("File dropped:", file.name);
        setProductImage(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <div 
      className={cn(`flex items-center justify-center h-16 border-2 border-dashed border-gray-700 rounded-md mb-6`, className)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {!productImage ? (
        <div className="text-center">
          <Upload size={16} className="text-gray-600 mx-auto mb-1" />
          <p className="text-gray-400 text-xs">Drop your product image here or</p>
          <Button 
            className="mt-1 bg-[#6E59A5] hover:bg-[#5d4a8e] text-xs px-2 py-0.5 h-5"
            onClick={handleUploadButtonClick}
          >
            Upload Image
          </Button>
          <Input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={URL.createObjectURL(productImage)} 
            alt="Product" 
            className="max-h-full max-w-full object-contain" 
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 rounded-full h-5 w-5"
            onClick={() => setProductImage(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
