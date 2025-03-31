
import React, { useEffect, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import { toast } from "sonner";

interface ContentGeneratorProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedImage: string | null;
}

const ContentGenerator = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  onGenerate,
  generatedImage
}: ContentGeneratorProps) => {
  
  const [localGeneratedImage, setLocalGeneratedImage] = useState<string | null>(generatedImage);
  const [hasProductImage, setHasProductImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    if (generatedImage && generatedImage !== localGeneratedImage) {
      setLocalGeneratedImage(generatedImage);
      setImageError(false);
    }
  }, [generatedImage]);
  
  // Update product image status
  useEffect(() => {
    setHasProductImage(productImage !== null);
  }, [productImage]);
  
  // Listen for the imageGenerated event
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("Image generated event received:", event.detail);
      if (event.detail.imageUrl) {
        setLocalGeneratedImage(event.detail.imageUrl);
        setImageError(false);
        
        // Preload the image to ensure it loads correctly
        const img = new Image();
        img.src = event.detail.imageUrl;
        img.onload = () => console.log("Image preloaded successfully");
        img.onerror = () => {
          console.error("Failed to preload image");
          setImageError(true);
        };
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, []);
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    onGenerate();
  };

  const handleImageRetry = () => {
    if (localGeneratedImage) {
      // Force image reload
      const timestamp = new Date().getTime();
      const imageWithCacheBuster = localGeneratedImage.includes('?') 
        ? `${localGeneratedImage}&t=${timestamp}` 
        : `${localGeneratedImage}?t=${timestamp}`;
      
      setLocalGeneratedImage(imageWithCacheBuster);
      setImageError(false);
    } else {
      // If no image, trigger generation
      onGenerate();
    }
  };

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <form onSubmit={handlePromptSubmit} className="mb-4">
        <div className="flex flex-col space-y-3">
          <Textarea 
            placeholder="Describe what kind of image, color codes, and style you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px] bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex justify-end">
            <Button type="submit" className="bg-[#8c52ff] hover:bg-[#7a45e6] h-6 px-2 py-0.5 text-xs">
              <Send className="mr-1 h-3 w-3" />
              Send
            </Button>
          </div>
        </div>
      </form>
      
      {localGeneratedImage && (
        <div className="mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
          <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
            <span>Generated Image</span>
            {imageError && (
              <Button 
                onClick={handleImageRetry} 
                variant="ghost" 
                className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6]"
              >
                Retry
              </Button>
            )}
          </div>
          <div className="p-2 bg-gray-800 min-h-[200px] flex items-center justify-center">
            {imageError ? (
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-400">Failed to load image</p>
                <Button 
                  onClick={handleImageRetry}
                  className="mt-2 bg-[#8c52ff] hover:bg-[#7a45e6] text-xs"
                >
                  Retry Loading
                </Button>
              </div>
            ) : (
              <img 
                key={localGeneratedImage} // Force re-render when URL changes
                src={localGeneratedImage} 
                alt="Generated content" 
                className="w-full h-48 object-contain rounded"
                onError={(e) => {
                  console.log("Image failed to load, marking as error");
                  setImageError(true);
                  // Don't set fallback src here, we'll show an error UI instead
                }}
              />
            )}
          </div>
        </div>
      )}
      
      <ImageUploader 
        productImage={productImage} 
        setProductImage={setProductImage} 
      />
      
      {/* Show the uploaded product image status */}
      {hasProductImage && (
        <div className="mt-2 mb-3 text-xs text-green-400 text-center">
          Product image uploaded successfully
        </div>
      )}
      
      <GenerateButton 
        isGenerating={isGenerating} 
        disabled={!prompt.trim()} 
        onClick={onGenerate} 
      />
    </div>
  );
};

export default ContentGenerator;
