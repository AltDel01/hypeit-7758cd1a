
import React, { useEffect, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from './ImageUploader';
import GenerateButton from './GenerateButton';
import { toast } from "sonner";

interface ContentGeneratorProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedImage: string | null;
}

const ContentGenerator = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  onGenerate,
  generatedImage
}: ContentGeneratorProps) => {
  
  const [localGeneratedImage, setLocalGeneratedImage] = useState<string | null>(generatedImage);
  const [hasProductImage, setHasProductImage] = useState<boolean>(false);
  
  // Update local generated image when the prop changes
  useEffect(() => {
    console.log("generatedImage prop changed:", generatedImage);
    setLocalGeneratedImage(generatedImage);
  }, [generatedImage]);
  
  // Update product image status
  useEffect(() => {
    setHasProductImage(productImage !== null);
  }, [productImage]);
  
  // Listen for the imageGenerated event
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("Image generated event received:", event.detail);
      setLocalGeneratedImage(event.detail.imageUrl);
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, []);
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    onGenerate();
  };

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <form onSubmit={handlePromptSubmit} className="mb-4">
        <div className="flex flex-col space-y-3">
          <Textarea 
            placeholder="Describe what kind of image, color codes, and style you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px] bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex justify-end">
            <Button type="submit" className="bg-[#8c52ff] hover:bg-[#7a45e6] h-6 px-2 py-0.5 text-xs">
              <Send className="mr-1 h-3 w-3" />
              Send
            </Button>
          </div>
        </div>
      </form>
      
      {localGeneratedImage && (
        <div className="mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
          <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs">
            Generated Image
          </div>
          <div className="p-2">
            <img 
              src={localGeneratedImage} 
              alt="Generated content" 
              className="w-full object-contain rounded"
            />
          </div>
        </div>
      )}
      
      <ImageUploader 
        productImage={productImage} 
        setProductImage={setProductImage} 
      />
      
      {/* Show the uploaded product image status */}
      {hasProductImage && (
        <div className="mt-2 mb-3 text-xs text-green-400 text-center">
          Product image uploaded successfully
        </div>
      )}
      
      <GenerateButton 
        isGenerating={isGenerating} 
        disabled={!prompt.trim()} 
        onClick={onGenerate} 
      />
    </div>
  );
};

export default ContentGenerator;
