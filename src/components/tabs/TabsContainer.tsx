
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentGenerator from './ContentGenerator';
import SocialTab from './SocialTab';
import MediaTabContent from './MediaTabContent';

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
  return (
    <Tabs 
      defaultValue={activeTab} 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 h-12 mb-8">
        <TabsTrigger 
          value="feed" 
          className="data-[state=active]:bg-[#8C52FF] data-[state=active]:text-white"
        >
          Feed Post
        </TabsTrigger>
        <TabsTrigger 
          value="story" 
          className="data-[state=active]:bg-[#8C52FF] data-[state=active]:text-white"
        >
          Story Post
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed" className="space-y-4">
        <ContentGenerator 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          onGenerate={generateImage}
          generatedImage={generatedImage || null}
          setIsGenerating={setIsGenerating}
        />
      </TabsContent>
      
      <TabsContent value="story" className="space-y-4">
        <MediaTabContent 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          onGenerate={generateImage}
          generatedImage={generatedImage || null}
          setIsGenerating={setIsGenerating}
        />
      </TabsContent>
      
      <TabsContent value="social" className="space-y-4">
        <SocialTab 
          xText={""} 
          linkedinText={""}
          setXText={setXText}
          setLinkedinText={setLinkedinText}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
