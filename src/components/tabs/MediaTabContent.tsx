
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ContentGenerator from './ContentGenerator';

interface MediaTabContentProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedImage: string | null;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const MediaTabContent = ({ 
  prompt, 
  setPrompt, 
  productImage, 
  setProductImage, 
  isGenerating, 
  onGenerate,
  generatedImage,
  setIsGenerating
}: MediaTabContentProps) => {
  return (
    <Card className="border-gray-700 bg-transparent">
      <CardContent className="pt-4">
        <ContentGenerator 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          onGenerate={onGenerate}
          generatedImage={generatedImage}
          setIsGenerating={setIsGenerating}
        />
      </CardContent>
    </Card>
  );
};

export default MediaTabContent;
