
import React from 'react';
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import SocialTab from './SocialTab';
import MediaTabContent from './MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';
import { Instagram, Linkedin } from 'lucide-react';

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  generateImage: () => void;
  xText: string;
  setXText: React.Dispatch<React.SetStateAction<string>>;
  linkedinText: string;
  setLinkedinText: React.Dispatch<React.SetStateAction<string>>;
  generatedImage: string | null;
  setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const TabsContainer = ({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  setIsGenerating,
  generateImage,
  xText,
  setXText,
  linkedinText,
  setLinkedinText,
  generatedImage,
  setGeneratedImage
}: TabsContainerProps) => {
  return (
    <Tabs defaultValue="feed" onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-5 h-auto gap-1">
        <SocialTab value="feed" icon={<Instagram size={18} />} label="Feed" />
        <SocialTab value="story" icon={<Instagram size={18} />} label="Story" />
        <SocialTab 
          value="tiktok" 
          icon={
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M19.321 5.562a5.124 5.124 0 0 1-5.006-4.088H10.44v15.709c0 2.058-1.562 3.729-3.441 3.729-1.88 0-3.441-1.671-3.441-3.729 0-2.059 1.562-3.729 3.441-3.729.379 0 .74.066 1.084.18V9.738a7.066 7.066 0 0 0-1.084-.084C3.037 9.654 0 12.969 0 17.014c0 4.043 3.037 7.358 6.779 7.358 3.741 0 6.779-3.315 6.779-7.358V9.192a8.72 8.72 0 0 0 5.483 1.939l.28-5.569z" 
                fill="currentColor"
              />
            </svg>
          } 
          label="TikTok" 
        />
        <SocialTab 
          value="x" 
          icon={
            <svg 
              viewBox="0 0 24 24" 
              width="18" 
              height="18" 
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          } 
          label="" 
        />
        <SocialTab value="linkedin" icon={<Linkedin size={18} />} label="LinkedIn" />
      </TabsList>

      <TabsContent value="feed">
        <MediaTabContent 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          generateImage={generateImage}
          generatedImage={generatedImage}
          setGeneratedImage={setGeneratedImage}
        />
      </TabsContent>
      
      <TabsContent value="story">
        <MediaTabContent 
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          generateImage={generateImage}
          generatedImage={generatedImage}
          setGeneratedImage={setGeneratedImage}
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
