
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
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-2">
        <GenerateButton 
          onClick={generateImage} 
          isGenerating={isGenerating}
          disabled={!prompt.trim()} 
        />
        
        {isGenerating ? (
          <div className="text-center p-4 bg-gray-900 rounded-lg w-full flex flex-col items-center justify-center">
            <CircularProgressIndicator 
              progress={0} 
              size="medium" 
              showPercentage={true} 
            />
            <p className="text-gray-400 mt-2">Generating your image...</p>
          </div>
        ) : (
          <div className="relative w-full bg-[#1A1F2C] rounded-lg overflow-hidden flex items-center justify-center border-2 border-[#8c52ff]/60">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF]"></div>
            <div className="w-full py-6 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center animate-glow-pulse">
                <CircularProgressIndicator 
                  progress={0} 
                  size="medium" 
                  showPercentage={true} 
                  gradientId="noImageGeneratedProgress"
                />
              </div>
              <p className="text-white mt-3 text-sm">Ready to generate your image</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptForm;
