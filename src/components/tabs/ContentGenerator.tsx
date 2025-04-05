
import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import PromptForm from './PromptForm';
import ImagePreview from './ImagePreview';
import ImageUploadStatus from './ImageUploadStatus';
import { sendToMakeWebhook } from '@/utils/image/webhookHandler';

interface ContentGeneratorProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedImage: string | null;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContentGenerator = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  onGenerate,
  generatedImage,
  setIsGenerating
}: ContentGeneratorProps) => {
  
  const [localGeneratedImage, setLocalGeneratedImage] = useState<string | null>(generatedImage);
  const [hasProductImage, setHasProductImage] = useState<boolean>(false);
  const [isUsingWebhook, setIsUsingWebhook] = useState<boolean>(false);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    if (generatedImage) {
      setLocalGeneratedImage(generatedImage);
    }
  }, [generatedImage]);
  
  // Update product image status
  useEffect(() => {
    setHasProductImage(productImage !== null);
  }, [productImage]);
  
  // Listen for the imageGenerated event
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent<{ imageUrl: string }>) => {
      if (event.detail.imageUrl) {
        setLocalGeneratedImage(event.detail.imageUrl);
        setIsGenerating(false);
      }
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, [setIsGenerating]);
  
  // Handle direct generation via webhook when product image is available
  const handleGenerateWithWebhook = async () => {
    if (!productImage) {
      console.log("No product image available for webhook");
      return false;
    }
    
    setIsGenerating(true);
    setIsUsingWebhook(true);
    
    try {
      // Send the image to the webhook and get the response, include the prompt
      const imageUrl = await sendToMakeWebhook(productImage, prompt);
      
      if (imageUrl) {
        console.log("Received image URL from webhook:", imageUrl);
        setLocalGeneratedImage(imageUrl);
        setIsGenerating(false);
        return true;
      }
    } catch (error) {
      console.error("Error using webhook:", error);
    } finally {
      setIsUsingWebhook(false);
      setIsGenerating(false);
    }
    
    return false;
  };
  
  // Handle generation with either webhook or fallback
  const handleGenerate = async () => {
    // If we have a product image, try the webhook first
    if (productImage) {
      const webhookSuccess = await handleGenerateWithWebhook();
      if (webhookSuccess) {
        return; // Successfully generated with webhook
      }
    }
    
    // Fall back to the original generation method
    onGenerate();
  };
  
  const handleImageRetry = () => {
    handleGenerate();
  };

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <PromptForm 
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleGenerate}
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
        onClick={handleGenerate}
      />
    </div>
  );
};

export default ContentGenerator;
