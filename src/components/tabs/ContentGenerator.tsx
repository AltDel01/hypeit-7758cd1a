
import React from 'react';
import PromptForm from './PromptForm';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';
import GenerateButton from './GenerateButton';

interface ContentGeneratorProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedImage: string | null;
  aspectRatio: string;
}

const ContentGenerator = ({
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  onGenerate,
  generatedImage,
  aspectRatio
}: ContentGeneratorProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PromptForm 
              prompt={prompt}
              setPrompt={setPrompt}
              isGenerating={isGenerating}
              onSubmit={onGenerate}
            />
            <div className="mt-4">
              <ImageUploader 
                productImage={productImage}
                setProductImage={setProductImage}
              />
            </div>
            <div className="mt-4">
              <GenerateButton 
                onClick={onGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </div>
          <div>
            <ImagePreview 
              generatedImage={generatedImage}
              isLoading={isGenerating}
              aspectRatio={aspectRatio}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
