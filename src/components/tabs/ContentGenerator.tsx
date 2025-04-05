
import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import PromptForm from './PromptForm';
import ImagePreview from './ImagePreview';
import ImageUploadStatus from './ImageUploadStatus';
import { generateImageWithWebhook } from '@/utils/image/webhookHandler';
import { toast } from 'sonner';

interface ContentGeneratorProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  generatedImage: string | null;
  setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ContentGenerator = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  setIsGenerating,
  generatedImage,
  setGeneratedImage
}: ContentGeneratorProps) => {
  
  const [hasProductImage, setHasProductImage] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Update product image status
  useEffect(() => {
    setHasProductImage(productImage !== null);
  }, [productImage]);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    try {
      setIsGenerating(true);
      toast.info("Generating image...");
      
      // Generate image directly with webhook
      const imageUrl = await generateImageWithWebhook(prompt, productImage);
      
      // Set the generated image
      setGeneratedImage(imageUrl);
      toast.success("Image generated successfully!");
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleImageRetry = () => {
    setRetryCount(prev => prev + 1);
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
        imageUrl={generatedImage}
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
