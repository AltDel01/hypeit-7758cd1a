
import React from 'react';
import ContentGenerator from './ContentGenerator';

interface MediaTabContentProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  generateImage: () => void;
}

const MediaTabContent = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  generateImage 
}: MediaTabContentProps) => {
  return (
    <div className="mt-6">
      <ContentGenerator 
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        onGenerate={generateImage}
      />
    </div>
  );
};

export default MediaTabContent;
