
import React from 'react';
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import MediaTabContent from './MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';
import { Linkedin } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [aspectRatio, setAspectRatio] = React.useState("1:1");
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">Social Media Visual</label>
          <Select defaultValue={aspectRatio} onValueChange={(value) => setAspectRatio(value)}>
            <SelectTrigger className="w-full bg-gray-900 border border-gray-700 text-white">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border border-gray-700 text-white">
              <SelectGroup>
                <SelectItem value="1:1" className="text-white hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-500"></div>
                    <span>1:1</span>
                  </div>
                </SelectItem>
                <SelectItem value="9:16" className="text-white hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-4 border border-gray-500"></div>
                    <span>9:16</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">Images Per Batch</label>
          <div className="flex gap-2 bg-gray-800 p-1 rounded-full w-full">
            <button className="flex-1 py-2 px-4 rounded-full bg-gray-600 text-white">1</button>
            <button className="flex-1 py-2 px-4 rounded-full text-gray-300 hover:bg-gray-700 transition-colors">3</button>
            <button className="flex-1 py-2 px-4 rounded-full text-gray-300 hover:bg-gray-700 transition-colors">
              15 <span className="text-amber-400">♦</span>
            </button>
            <button className="flex-1 py-2 px-4 rounded-full text-gray-300 hover:bg-gray-700 transition-colors">
              25 <span className="text-amber-400">♦</span>
            </button>
          </div>
        </div>
      </div>
    
      <Tabs defaultValue="social" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-2 h-auto gap-1">
          <div 
            className={`flex items-center justify-center p-2 rounded cursor-pointer ${activeTab === "x" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            onClick={() => setActiveTab("x")}
          >
            <svg 
              viewBox="0 0 24 24" 
              width="18" 
              height="18" 
              fill="currentColor"
              className="mr-2"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X</span>
          </div>
          <div 
            className={`flex items-center justify-center p-2 rounded cursor-pointer ${activeTab === "linkedin" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            onClick={() => setActiveTab("linkedin")}
          >
            <Linkedin size={18} className="mr-2" />
            <span>LinkedIn</span>
          </div>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <MediaTabContent 
            prompt={prompt}
            setPrompt={setPrompt}
            productImage={productImage}
            setProductImage={setProductImage}
            isGenerating={isGenerating}
            generateImage={generateImage}
            generatedImage={generatedImage}
            aspectRatio={aspectRatio}
          />
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
    </div>
  );
};

export default TabsContainer;
