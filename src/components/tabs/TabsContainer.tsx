
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentGenerator from './ContentGenerator';
import SocialTab from './SocialTab';
import { Square, Smartphone } from 'lucide-react';

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  generateImage: () => void;
  setXText: React.Dispatch<React.SetStateAction<string>>;
  setLinkedinText: React.Dispatch<React.SetStateAction<string>>;
  generatedImage: string | null;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabsContainer = ({ 
  activeTab, 
  setActiveTab,
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  generateImage,
  setXText,
  setLinkedinText,
  generatedImage,
  setIsGenerating
}: TabsContainerProps) => {
  
  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="feed" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
          <Square className="mr-1 h-4 w-4" />
          Feed
        </TabsTrigger>
        <TabsTrigger value="story" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
          <Smartphone className="mr-1 h-4 w-4" />
          Story
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed" className="focus-visible:outline-none focus-visible:ring-0">
        <ContentGenerator
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          onGenerate={generateImage}
          generatedImage={generatedImage}
          setIsGenerating={setIsGenerating}
        />
      </TabsContent>
      
      <TabsContent value="story" className="focus-visible:outline-none focus-visible:ring-0">
        <ContentGenerator
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          onGenerate={generateImage}
          generatedImage={generatedImage}
          setIsGenerating={setIsGenerating}
        />
      </TabsContent>
      
      <TabsContent value="social" className="focus-visible:outline-none focus-visible:ring-0">
        <SocialTab
          setXText={setXText}
          setLinkedinText={setLinkedinText}
          prompt={prompt}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
