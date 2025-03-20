
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  Copy, 
  Upload, 
  ArrowUp, 
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    setPrompt("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="col-span-5 p-6 border-r border-gray-800">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Create Image that sells your product</h1>
            
            <div className="mb-6">
              <Tabs defaultValue="feed" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-5 h-auto gap-1">
                  <SocialTab value="feed" icon={<Instagram size={18} />} label="Feed" />
                  <SocialTab value="story" icon={<Instagram size={18} />} label="Story" />
                  <SocialTab value="tiktok" icon={<div className="text-md font-bold">TT</div>} label="TikTok" />
                  <SocialTab value="x" icon={<Twitter size={18} />} label="X" />
                  <SocialTab value="linkedin" icon={<Linkedin size={18} />} label="LinkedIn" />
                </TabsList>

                <TabsContent value="feed" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                    <form onSubmit={handlePromptSubmit} className="mb-4">
                      <div className="flex flex-col space-y-3">
                        <Textarea 
                          placeholder="Describe what kind of image, color, and style you want..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
                        />
                        <div className="flex justify-end">
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-md mb-4">
                      <div className="text-center">
                        <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Drop your product image here or</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 h-8">Upload Image</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="story" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                    <form onSubmit={handlePromptSubmit} className="mb-4">
                      <div className="flex flex-col space-y-3">
                        <Textarea 
                          placeholder="Describe what kind of image, color, and style you want..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
                        />
                        <div className="flex justify-end">
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-md mb-4">
                      <div className="text-center">
                        <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Drop your product image here or</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 h-8">Upload Image</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tiktok" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                    <p className="text-gray-400 text-center">TikTok content generation coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="x" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                    <p className="text-gray-400 text-center">X content generation coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="linkedin" className="mt-6">
                  <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                    <p className="text-gray-400 text-center">LinkedIn content generation coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="col-span-7 grid grid-cols-12 gap-0 h-screen">
          <div className="col-span-6 p-4 bg-[#121212] overflow-y-auto max-h-screen">
            <div className="grid grid-cols-1 gap-5 animate-scroll">
              {feedImages.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden relative group">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full aspect-square object-cover" 
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
          
          <div className="col-span-6 p-4 bg-[#121212] overflow-y-auto max-h-screen">
            <div className="grid grid-cols-1 gap-5 animate-scroll">
              {storyImages.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden relative group">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full aspect-[9/16] object-cover" 
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

const feedImages = [
  {
    src: "/lovable-uploads/a36d5fc7-d77d-4c73-896a-787bb22b74c4.png",
    alt: "Explore Thailand - Square format"
  },
  {
    src: "/lovable-uploads/ba77f210-fc55-4175-8640-5d671e03c3a0.png",
    alt: "Elegant House - Square format"
  },
  {
    src: "/lovable-uploads/26ff0b9c-a999-4e58-b379-bdb61091d81f.png",
    alt: "Earth Hour - Square format"
  },
  {
    src: "/lovable-uploads/8c8108e7-4987-4914-96f4-9e21afdafb9a.png",
    alt: "Borcelle Restaurant - Square format"
  },
  {
    src: "/lovable-uploads/7aef90e5-58c4-4380-b4e2-b613a2a30be1.png",
    alt: "Pastries - Square format"
  },
  {
    src: "/lovable-uploads/b014adca-4281-467f-9421-542ca7bac029.png",
    alt: "Hot Spicy Pizza - Square format"
  },
  {
    src: "/lovable-uploads/8bba7cc2-64da-4208-9c50-738876bae777.png",
    alt: "Sneakers Store - Square format"
  },
  {
    src: "/lovable-uploads/8ea67ce8-3265-4ca2-a255-9b59dec27a23.png",
    alt: "Stay Hydrated - Square format"
  },
  {
    src: "/lovable-uploads/2ff388cc-44d6-489b-b265-e21659f31f95.png",
    alt: "Sneakers Store - Square format"
  },
  {
    src: "/lovable-uploads/b84a52e5-35a0-4aed-aa7f-5d8955bbf306.png",
    alt: "Lumivera Radiant Serum - Square format"
  },
  {
    src: "/lovable-uploads/2d93e533-b9d5-4286-b313-fc590b8c9f73.png",
    alt: "Hot Spicy Pizza - Square format"
  },
  {
    src: "/lovable-uploads/fe7b4491-efca-4abd-a278-3456db1e48c7.png",
    alt: "Elegant House - Square format"
  },
  {
    src: "/lovable-uploads/48c39036-d7ee-4f0f-bb03-2957efd34d5d.png",
    alt: "Earth Hour - Square format"
  },
  {
    src: "/lovable-uploads/b70080aa-6fe0-4fc1-8d20-81ecfdb1e1c9.png",
    alt: "Borcelle Restaurant - Square format"
  },
];

const storyImages = [
  {
    src: "/lovable-uploads/15930e55-8065-44f9-b993-e2203c7d0d68.png",
    alt: "Chocolate Day - Story format"
  },
  {
    src: "/lovable-uploads/aa4b197d-e10f-4132-b7f9-31449783dea4.png",
    alt: "Coming Soon - Story format"
  },
  {
    src: "/lovable-uploads/7cf630db-6939-4ca6-8589-73836e330f1e.png",
    alt: "Cocktail Party - Story format"
  },
  {
    src: "/lovable-uploads/e294ecc1-d57a-4657-9455-40839817d622.png",
    alt: "2024 New Arrival - Story format"
  },
  {
    src: "/lovable-uploads/2c871241-de11-4104-b4a3-ce74017861a5.png",
    alt: "We Are Brewing - Story format"
  },
  {
    src: "/lovable-uploads/a5a7db89-1eb7-4dca-a51b-b2c65fab4393.png",
    alt: "Stay Hydrated - Story format"
  },
  {
    src: "/lovable-uploads/aab5bb25-14d6-46a5-be5e-d249fdf741ea.png",
    alt: "Delicious Ice Cream - Story format"
  },
  {
    src: "/lovable-uploads/ba036cf2-f597-41e5-8650-821a023df877.png",
    alt: "Lumivera Radiant Serum - Story format"
  },
  {
    src: "/lovable-uploads/6940dffe-9415-469a-a350-f90592be4665.png",
    alt: "Explore Thailand - Story format"
  },
];

export default Index;
