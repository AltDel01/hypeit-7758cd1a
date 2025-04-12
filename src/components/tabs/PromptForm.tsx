
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import GenerateButton from './GenerateButton';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';

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
        
        {productImage && (
          <ImagePreview 
            image={productImage} 
            onRemove={() => setProductImage(null)} 
          />
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isGenerating && (
            <CircularProgressIndicator progress={0} size="small" showPercentage={true} />
          )}
        </div>
        <GenerateButton 
          onClick={generateImage} 
          isGenerating={isGenerating} 
        />
      </div>
      
      <div className="bg-gray-900 rounded-lg p-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CircularProgressIndicator progress={0} size="medium" showPercentage={true} />
          <div className="text-center">
            <p className="text-gray-400">No generated image yet</p>
            <p className="text-sm text-gray-500">Fill out the form above and click Generate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptForm;
