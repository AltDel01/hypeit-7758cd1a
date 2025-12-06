
import React, { useEffect, useState } from 'react';
import PromptForm from './PromptForm';
import ImageUploadStatus from './ImageUploadStatus';
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
  const [retryCount, setRetryCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    if (generatedImage && generatedImage !== localGeneratedImage) {
      setLocalGeneratedImage(generatedImage);
      // Reset error count when we get a new image
      setErrorCount(0);
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
      
      if (event.detail.error) {
        // Track errors from generation process
        setErrorCount(prev => prev + 1);
        toast.error(event.detail.error);
      }
      
      if (event.detail.imageUrl) {
        // Add a cache-buster to the URL
        const timestamp = Date.now();
        const url = event.detail.imageUrl.includes('?') 
          ? `${event.detail.imageUrl}&cb=${timestamp}` 
          : `${event.detail.imageUrl}?cb=${timestamp}`;
          
        setLocalGeneratedImage(url);
        setRetryCount(0);
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, []);
  
  const handleImageRetry = () => {
    setRetryCount(prev => prev + 1);
    
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
        toast.info("Fetching a different image...");
      } else {
        // For other URLs, just add a cache buster
        const imageWithCacheBuster = localGeneratedImage.includes('?') 
          ? `${localGeneratedImage}&t=${timestamp}` 
          : `${localGeneratedImage}?t=${timestamp}`;
        
        setLocalGeneratedImage(imageWithCacheBuster);
      }
    } else if (retryCount > 2 || errorCount > 0) {
      // If we've had errors or tried a few times and still no image, trigger a new generation
      toast.info("Attempting to generate a new image...");
      onGenerate();
    } else {
      // If no image, trigger generation
      onGenerate();
    }
  };

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <PromptForm 
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        generateImage={onGenerate}
      />
      
      {hasProductImage && <ImageUploadStatus hasProductImage={hasProductImage} />}
      
      {/* Generated Image Preview Box */}
      {localGeneratedImage && (
        <div className="mt-4 p-4 rounded-lg border-2 border-[#9b87f5] bg-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#9b87f5] flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Generated Result
            </h3>
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = localGeneratedImage;
                a.download = 'generated-image.jpg';
                a.click();
                toast.success("Image downloaded");
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Download
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gray-900">
            <img 
              src={localGeneratedImage} 
              alt="Generated result" 
              className="w-full aspect-square object-cover"
              onError={(e) => {
                console.error("Image failed to load:", localGeneratedImage);
                toast.error("Failed to load generated image");
              }}
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              AI Generated
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Your generated image is ready! It also appears in the gallery on the right →
          </p>
        </div>
      )}
      
      {isGenerating && !localGeneratedImage && (
        <div className="mt-4 p-4 rounded-lg border-2 border-gray-600 bg-gray-800/50">
          <div className="flex items-center justify-center mb-3">
            <div className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-300">
              Generating...
            </h3>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-[#9b87f5] mb-3"></div>
              <p className="text-sm text-gray-400">Creating your image...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
