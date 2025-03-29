
import React from 'react';
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
}

const ContentGenerator = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  onGenerate 
}: ContentGeneratorProps) => {
  
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-6 px-2 py-0.5 text-xs">
              <Send className="mr-1 h-3 w-3" />
              Send
            </Button>
          </div>
        </div>
      </form>
      
      <ImageUploader 
        productImage={productImage} 
        setProductImage={setProductImage} 
      />
      
      <GenerateButton 
        isGenerating={isGenerating} 
        disabled={!prompt.trim()} 
        onClick={onGenerate} 
      />
    </div>
  );
};

export default ContentGenerator;
