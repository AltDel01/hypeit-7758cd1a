
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
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  generateImage: () => void;
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
  generateImage,
  generatedImage,
  setGeneratedImage
}: ContentGeneratorProps) => {
  
  const [hasProductImage, setHasProductImage] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Update product image status
  useEffect(() => {
    setHasProductImage(productImage !== null);
  }, [productImage]);
  
  const handleImageRetry = () => {
    setRetryCount(prev => prev + 1);
    generateImage();
  };

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <PromptForm 
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={generateImage}
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
        onClick={generateImage} 
      />
    </div>
  );
};

export default ContentGenerator;
