
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import GenerateButton from './GenerateButton';
import ImageUploader from './ImageUploader';
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
          <div className="rounded-lg overflow-hidden border border-gray-600 mt-2">
            <div className="bg-gray-800 px-2 py-1 text-white text-xs">
              Product Image
            </div>
            <div className="p-2 bg-gray-900 flex items-center justify-center">
              <img 
                src={URL.createObjectURL(productImage)} 
                alt="Product" 
                className="h-48 object-contain" 
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/50 text-white rounded-full"
                onClick={() => setProductImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-2">
        {isGenerating && (
          <CircularProgressIndicator progress={0} size="small" showPercentage={true} />
        )}
        
        {!isGenerating && (
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

