
import React, { useEffect, useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [retryCount, setRetryCount] = useState<number>(0);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    if (generatedImage && generatedImage !== localGeneratedImage) {
      setLocalGeneratedImage(generatedImage);
      setImageError(false);
      setImageLoading(true);
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
        // Add a cache-buster to the URL
        const timestamp = Date.now();
        const url = event.detail.imageUrl.includes('?') 
          ? `${event.detail.imageUrl}&cb=${timestamp}` 
          : `${event.detail.imageUrl}?cb=${timestamp}`;
          
        setLocalGeneratedImage(url);
        setImageError(false);
        setRetryCount(0);
        setImageLoading(true);
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
    setRetryCount(prev => prev + 1);
    setImageLoading(true);
    
    if (localGeneratedImage) {
      // Force image reload with a new cache buster
      const timestamp = Date.now();
      
      if (localGeneratedImage.includes('unsplash.com')) {
        // For Unsplash URLs, create a completely new request to get a different image
        const searchTerms = prompt
          .split(' ')
          .filter(word => word.length > 3)
          .slice(0, 3)
          .join(',');
        
        const newUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms || 'product')}&t=${timestamp}`;
        setLocalGeneratedImage(newUrl);
        toast.info("Fetching a new image...");
      } else {
        // For other URLs, just add a cache buster
        const imageWithCacheBuster = localGeneratedImage.includes('?') 
          ? `${localGeneratedImage}&t=${timestamp}` 
          : `${localGeneratedImage}?t=${timestamp}`;
        
        setLocalGeneratedImage(imageWithCacheBuster);
      }
      
      setImageError(false);
    } else if (retryCount > 2) {
      // If we've tried a few times and still no image, trigger a new generation
      onGenerate();
    } else {
      // If no image, trigger generation
      onGenerate();
    }
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageError(false);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
    // Auto-retry once for Unsplash images
    if (localGeneratedImage?.includes('unsplash.com') && retryCount === 0) {
      setTimeout(handleImageRetry, 500);
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
            {(imageError || retryCount > 0) && (
              <Button 
                onClick={handleImageRetry} 
                variant="ghost" 
                className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6] flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
          <div className="p-2 bg-gray-800 min-h-[200px] flex items-center justify-center">
            {imageLoading && !imageError ? (
              <div className="animate-pulse flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-[#8c52ff]/30 mb-2"></div>
                <p className="text-xs text-gray-300">Loading image...</p>
              </div>
            ) : imageError ? (
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-400">Failed to load image</p>
                <Button 
                  onClick={handleImageRetry}
                  className="mt-2 bg-[#8c52ff] hover:bg-[#7a45e6] text-xs flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Loading
                </Button>
              </div>
            ) : (
              <img 
                ref={imageRef}
                key={`${localGeneratedImage}-${retryCount}`} // Force re-render when URL changes or retry count increases
                src={localGeneratedImage} 
                alt="Generated content" 
                className="w-full h-48 object-contain rounded"
                onError={handleImageError}
                onLoad={handleImageLoad}
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
