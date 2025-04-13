
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import GenerateButton from './GenerateButton';
import ImageUploader from './ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import ImageLoadingState from '@/components/ui/loading/ImageLoadingState';

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  productImage: File | null;
  setProductImage: (file: File | null) => void;
  isGenerating: boolean;
  generateImage: () => void;
}

const PromptForm = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  generateImage 
}: PromptFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe what you want in your image..."
          className="min-h-[100px] resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <div className="pt-2">
          <ImageUploader 
            productImage={productImage} 
            setProductImage={setProductImage} 
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-2">
        {isGenerating ? (
          <div className="text-center p-4 bg-gray-900 rounded-lg w-full">
            <CircularProgressIndicator progress={0} size="small" showPercentage={true} />
            <p className="text-gray-400 mt-2">Generating your image...</p>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-900 rounded-lg w-full">
            <p className="text-gray-400">No generated image yet</p>
            <p className="text-sm text-gray-500 mt-2">Fill out the form and click Generate to create an image</p>
          </div>
        )}
        
        <GenerateButton 
          onClick={generateImage} 
          isGenerating={isGenerating}
          disabled={!prompt.trim()} 
        />
      </div>
    </div>
  );
};

export default PromptForm;
