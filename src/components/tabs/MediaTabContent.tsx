
import React from 'react';
import ContentGenerator from './ContentGenerator';

interface MediaTabContentProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  generateImage: () => void;
  generatedImage: string | null;
}

const MediaTabContent = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  generateImage,
  generatedImage
}: MediaTabContentProps) => {
  return (
    <div>
      <ContentGenerator 
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        onGenerate={generateImage}
        generatedImage={generatedImage}
      />
    </div>
  );
};

export default MediaTabContent;
