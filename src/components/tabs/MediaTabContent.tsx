
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
    <div className="mt-6 space-y-6">
      <ContentGenerator 
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        onGenerate={generateImage}
      />
      
      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center">
          {isGenerating ? 
            <span className="flex items-center">
              <span className="h-3 w-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Generating your image with DALL-E (may take up to 30 seconds)...
            </span> : 
            <span>Your Generated Image:</span>
          }
        </h3>
        <GeneratedImagePreview 
          imageUrl={generatedImage || ''} 
          aspectRatio={aspectRatio} 
        />
      </div>
    </div>
  );
};

export default MediaTabContent;
