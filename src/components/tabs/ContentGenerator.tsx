
import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import PromptForm from './PromptForm';
import ImagePreview from './ImagePreview';
import ImageUploadStatus from './ImageUploadStatus';

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
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    if (generatedImage && generatedImage !== localGeneratedImage) {
      setLocalGeneratedImage(generatedImage);
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
      } else {
        // For other URLs, just add a cache buster
        const imageWithCacheBuster = localGeneratedImage.includes('?') 
          ? `${localGeneratedImage}&t=${timestamp}` 
          : `${localGeneratedImage}?t=${timestamp}`;
        
        setLocalGeneratedImage(imageWithCacheBuster);
      }
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
        isGenerating={isGenerating} 
        disabled={!prompt.trim()} 
        onClick={onGenerate} 
      />
    </div>
  );
};

export default ContentGenerator;
