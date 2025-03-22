
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  image: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  id, 
  label, 
  icon, 
  onChange,
  image
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex items-center">
        <Input
          id={id}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="flex-1"
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="ml-2"
        >
          {icon}
        </Button>
      </div>
      {image && (
        <div className="mt-2 relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md border">
          <img
            src={URL.createObjectURL(image)}
            alt={label}
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
