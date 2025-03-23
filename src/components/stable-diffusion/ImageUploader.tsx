
import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from 'lucide-react';
import { toast } from "sonner";

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
  const [isUploading, setIsUploading] = useState(false);
  
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
        
        // Send to webhook
        sendImageToWebhook(file);
      }
    }
  }, [onChange]);

  const sendImageToWebhook = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('filename', file.name);
      formData.append('type', file.type);
      formData.append('size', file.size.toString());

      const webhookUrl = 'https://ekalovable.app.n8n.cloud/webhook-test/c7d65113-1128-44ee-bcdb-6d334459913c';
      
      console.log(`Sending ${file.name} to webhook: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Webhook response:', result);
      toast.success(`Image ${file.name} successfully sent to webhook`);
    } catch (error) {
      console.error('Error sending image to webhook:', error);
      toast.error(`Failed to send image to webhook: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Call the parent onChange handler
      onChange(e);
      
      // Send to webhook
      sendImageToWebhook(e.target.files[0]);
    }
  };
  
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div
        className={`mt-1 border-2 border-dashed rounded-md p-6 transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
        } ${isUploading ? 'opacity-70' : ''}`}
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
              {isUploading && (
                <div className="text-xs text-blue-500 mt-2">
                  Sending to webhook...
                </div>
              )}
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
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={image ? "hidden" : "hidden"}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
