
import React from 'react';
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import SocialTab from './SocialTab';
import MediaTabContent from './MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

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
  generatedImage
}: TabsContainerProps) => {
  return (
    <Tabs defaultValue="feed" onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-5 h-auto gap-1">
        <SocialTab value="feed" icon={<Instagram size={18} />} label="Feed" />
        <SocialTab value="story" icon={<Instagram size={18} />} label="Story" />
        <SocialTab value="tiktok" icon={<div className="text-md font-bold">TT</div>} label="TikTok" />
        <SocialTab value="x" icon={<Twitter size={18} />} label="X" />
        <SocialTab value="linkedin" icon={<Linkedin size={18} />} label="LinkedIn" />
      </TabsList>

      <TabsContent value="feed">
        <MediaTabContent 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          generateImage={generateImage}
          generatedImage={generatedImage}
          aspectRatio="square"
        />
      </TabsContent>
      
      <TabsContent value="story">
        <MediaTabContent 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          generateImage={generateImage}
          generatedImage={generatedImage}
          aspectRatio="story"
        />
      </TabsContent>
      
      <TabsContent value="tiktok" className="mt-6">
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <p className="text-gray-400 text-center">TikTok content generation coming soon</p>
        </div>
      </TabsContent>
      
      <TabsContent value="x" className="mt-6">
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">Generate Your X Post</h2>
          <XPostForm onGeneratePost={setXText} />
        </div>
      </TabsContent>
      
      <TabsContent value="linkedin" className="mt-6">
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">Generate Your LinkedIn Post</h2>
          <LinkedInPostForm onGeneratePost={setLinkedinText} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
