
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Upload, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  id?: string;
  label?: string;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  image?: File | null;
  onRemoveImage?: () => void;
  className?: string;
}

const ImageUploader = ({ 
  id = "image-upload", 
  label = "Upload Image", 
  icon = <Upload className="h-5 w-5" />, 
  onChange, 
  image, 
  onRemoveImage,
  className 
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {!image ? (
        <div 
          onClick={handleClick}
          className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:bg-gray-800 transition-colors p-4"
        >
          {icon}
          <p className="mt-2 text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Click to upload or drag and drop</p>
          <Input 
            id={id}
            type="file"
            ref={fileInputRef}
            onChange={onChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative h-40 bg-gray-800 rounded-md overflow-hidden">
          <img 
            src={URL.createObjectURL(image)} 
            alt="Uploaded image" 
            className="w-full h-full object-contain" 
          />
          {onRemoveImage && (
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={onRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
