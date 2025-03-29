
import React from 'react';
import ContentGenerator from './ContentGenerator';
import GeneratedImagePreview from './GeneratedImagePreview';

interface MediaTabContentProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  generateImage: () => void;
  generatedImage: string | null;
  aspectRatio: "square" | "story";
}

const MediaTabContent = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  generateImage,
  generatedImage,
  aspectRatio
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
      
      {generatedImage && (
        <div className="mt-6">
          <h3 className="text-white text-sm font-medium mb-2">Generated Result:</h3>
          <GeneratedImagePreview 
            imageUrl={generatedImage} 
            aspectRatio={aspectRatio} 
          />
        </div>
      )}
    </div>
  );
};

export default MediaTabContent;
