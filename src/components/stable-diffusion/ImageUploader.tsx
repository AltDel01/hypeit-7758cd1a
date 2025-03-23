
import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  image: File | null;
  onRemoveImage?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  id, 
  label, 
  icon, 
  onChange,
  image,
  onRemoveImage
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        // Create a synthetic event to pass to the onChange handler
        const syntheticEvent = {
          target: {
            files: e.dataTransfer.files
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
  }, [onChange]);
  
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div
        className={`mt-1 border-2 border-dashed rounded-md p-6 transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          {!image ? (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-400">
                PNG, JPG, GIF up to 10MB
              </div>
            </>
          ) : (
            <div className="relative w-full aspect-square max-h-[300px] overflow-hidden rounded-md">
              <img
                src={URL.createObjectURL(image)}
                alt={label}
                className="w-full h-full object-contain"
              />
              <Button 
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-8 w-8"
                onClick={onRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={onChange}
            className={image ? "hidden" : "hidden"}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
