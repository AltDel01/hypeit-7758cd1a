
import React, { useEffect, useState } from 'react';
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
  generatedImage?: string | null;
}

const PromptForm = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  generateImage,
  generatedImage 
}: PromptFormProps) => {
  const [generationProgress, setGenerationProgress] = useState(0);
  
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { progress } = event.detail;
      console.log("Progress update:", progress);
      setGenerationProgress(progress);
    };
    
    window.addEventListener('imageGenerationProgress', handleProgressUpdate as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerationProgress', handleProgressUpdate as EventListener);
    };
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe in detail what image you want from color include color code if possible, font, text, any other element..."
          className="min-h-[120px] resize-none focus:ring-2 focus:ring-[#8c52ff] focus:ring-offset-2 bg-[#1A1F2C] border border-[#8c52ff]/30 text-white"
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
              progress={generationProgress} 
              size="medium" 
              showPercentage={true} 
            />
            <p className="text-gray-400 mt-2">Generating your image...</p>
          </div>
        ) : (
          <div className="text-center p-4 rounded-lg w-full bg-[#1A1F2C] border border-[#8c52ff]/30 flex flex-col items-center justify-center">
            <CircularProgressIndicator 
              progress={0} 
              size="medium" 
              showPercentage={true} 
              gradientId="noImageGeneratedProgress"
            />
            <p className="text-white mt-3 text-sm">Ready to generate your image</p>
          </div>
        )}
      </div>
      
      {generatedImage && (
        <div className="mt-4 p-4 bg-[#1A1F2C] border border-[#8c52ff]/30 rounded-lg">
          <p className="text-white text-sm mb-2 font-medium">Generated Image:</p>
          <img 
            src={generatedImage} 
            alt="Generated result" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PromptForm;
