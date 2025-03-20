import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  Instagram, 
  Copy, 
  Upload, 
  ArrowUp, 
  Linkedin,
  Twitter as XIcon
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0">
        <div className="col-span-3 p-8 border-r border-gray-800">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Create Image that sells your product</h1>
            
            <div className="mb-8">
              <Tabs defaultValue="feed" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-5 h-auto gap-1">
                  <SocialTab value="feed" icon={<Instagram size={20} />} label="Feed" />
                  <SocialTab value="story" icon={<Instagram size={20} />} label="Story" />
                  <SocialTab value="tiktok" icon={<div className="text-md">♫</div>} label="TikTok" />
                  <SocialTab value="x" icon={<XIcon size={20} />} label="X" />
                  <SocialTab value="linkedin" icon={<Linkedin size={20} />} label="LinkedIn" />
                </TabsList>

                <TabsContent value="feed" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                    <div className="flex items-center justify-center h-80 border-2 border-dashed border-gray-700 rounded-md mb-6">
                      <div className="text-center">
                        <Upload size={48} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">Drop your product image here or</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700">Upload Image</Button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="story" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                    <div className="flex items-center justify-center h-80 border-2 border-dashed border-gray-700 rounded-md mb-6">
                      <div className="text-center">
                        <Upload size={48} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">Drop your product image here or</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700">Upload Image</Button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tiktok" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                    <p className="text-gray-400 text-center">TikTok content generation coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="x" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                    <p className="text-gray-400 text-center">X content generation coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="linkedin" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                    <p className="text-gray-400 text-center">LinkedIn content generation coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="col-span-2 p-6 bg-[#121212] overflow-y-auto max-h-screen">
          <div className="grid grid-cols-1 gap-5">
            {exampleImages.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden relative group">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full object-cover" 
                />
                <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="bg-black/70 text-white rounded-full h-8 w-8 p-0">
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const SocialTab = ({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) => {
  return (
    <TabsTrigger 
      value={value}
      className="flex items-center gap-2 py-2 data-[state=active]:bg-gray-800"
    >
      {icon}
      <span>{label}</span>
    </TabsTrigger>
  );
};

const exampleImages = [
  {
    src: "/lovable-uploads/580003f5-8524-4443-b8f6-d16ed798ec06.png",
    alt: "Examples of generated content"
  },
  {
    src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80",
    alt: "Sneakers advertisement"
  },
  {
    src: "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=930&q=80",
    alt: "Cocktail party advertisement"
  },
  {
    src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    alt: "Pizza advertisement"
  }
];

export default Index;
