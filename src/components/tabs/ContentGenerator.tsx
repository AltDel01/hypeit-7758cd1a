
import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import PromptForm from './PromptForm';
import ImagePreview from './ImagePreview';
import ImageUploadStatus from './ImageUploadStatus';
import { addCacheBusterToUrl } from '@/utils/image/polling/helpers';

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
  const [isStalled, setIsStalled] = useState<boolean>(false);
  const stalledTimerRef = React.useRef<number | null>(null);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    if (generatedImage && generatedImage !== localGeneratedImage) {
      setLocalGeneratedImage(generatedImage);
      setIsStalled(false);
      // Clear any stalled timer
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
        stalledTimerRef.current = null;
      }
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
        const url = addCacheBusterToUrl(event.detail.imageUrl);
        setLocalGeneratedImage(url);
        setIsStalled(false);
        setRetryCount(0);
        
        // Clear any stalled timer
        if (stalledTimerRef.current) {
          window.clearTimeout(stalledTimerRef.current);
          stalledTimerRef.current = null;
        }
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
      // Clean up timers
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
      }
    };
  }, []);
  
  // Set up stalled detection for very long operations
  useEffect(() => {
    if (isGenerating && !isStalled) {
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
      }
      
      // If generation takes more than 30 seconds, mark as stalled
      stalledTimerRef.current = window.setTimeout(() => {
        console.log("Image generation process has stalled");
        setIsStalled(true);
      }, 30000);
    } else if (!isGenerating) {
      // Clear timer when generation completes
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
        stalledTimerRef.current = null;
      }
    }
    
    return () => {
      if (stalledTimerRef.current) {
        window.clearTimeout(stalledTimerRef.current);
      }
    };
  }, [isGenerating, isStalled]);
  
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
      } else {
        // For other URLs, just add a cache buster
        const imageWithCacheBuster = addCacheBusterToUrl(localGeneratedImage);
        setLocalGeneratedImage(imageWithCacheBuster);
      }
      
      // Reset stalled state
      setIsStalled(false);
    } else if (retryCount > 2) {
      // If we've tried a few times and still no image, trigger a new generation
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
        onSubmit={onGenerate}
      />
      
      <ImagePreview 
        imageUrl={localGeneratedImage}
        prompt={prompt}
        onRetry={handleImageRetry}
      />
      
      <ImageUploader 
        productImage={productImage} 
        setProductImage={setProductImage} 
      />
      
      <ImageUploadStatus hasProductImage={hasProductImage} />
      
      <GenerateButton 
        isGenerating={isGenerating || isStalled} 
        disabled={!prompt.trim()} 
        onClick={isStalled ? handleImageRetry : onGenerate}
      />
    </div>
  );
};

export default ContentGenerator;
