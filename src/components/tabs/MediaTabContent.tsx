
import React from 'react';
import ContentGenerator from './ContentGenerator';

interface MediaTabContentProps {
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

const MediaTabContent = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  setIsGenerating,
  generateImage,
  generatedImage,
  setGeneratedImage
}: MediaTabContentProps) => {
  return (
    <div className="mt-6">
      <ContentGenerator 
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        generatedImage={generatedImage}
        setGeneratedImage={setGeneratedImage}
      />
    </div>
  );
};

export default MediaTabContent;
