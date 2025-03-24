import React, { useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AuroraBackground from '@/components/effects/AuroraBackground';
import { toast } from "sonner";
import { 
  Instagram, 
  Copy, 
  Upload, 
  ArrowUp, 
  Twitter,
  Linkedin,
  Send,
  X
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    setPrompt("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("File selected:", file.name);
      setProductImage(file);
      
      // Send to webhook
      sendImageToWebhook(file);
    }
  };
  
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        console.log("File dropped:", file.name);
        setProductImage(file);
        
        // Send to webhook
        sendImageToWebhook(file);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const sendImageToWebhook = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('filename', file.name);
      formData.append('type', file.type);
      formData.append('size', file.size.toString());

      const webhookUrl = 'https://ekalovable.app.n8n.cloud/webhook-test/c7d65113-1128-44ee-bcdb-6d334459913c';
      
      console.log(`Sending ${file.name} to webhook: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Webhook response:', result);
      toast.success(`Image ${file.name} successfully sent to webhook`);
    } catch (error) {
      console.error('Error sending image to webhook:', error);
      toast.error(`Failed to send image to webhook: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const generateTextContent = (platform: "x" | "linkedin") => {
    setIsGeneratingText(true);
    
    // Simulating text generation with a timeout
    setTimeout(() => {
      const productName = productImage ? productImage.name.split('.')[0] : "our product";
      
      if (platform === "x") {
        const generatedText = `Just launched ${productName}! This innovative solution will transform how you work. Check it out now! #ProductLaunch #Innovation`;
        setXText(generatedText);
        toast.success("X post content generated!");
      } else if (platform === "linkedin") {
        const generatedText = `We're excited to announce the release of ${productName}!\n\nAfter months of development and testing, our team has created a solution that addresses key challenges in the industry. ${productName} offers unparalleled efficiency and performance.\n\nVisit our website to learn more about how ${productName} can benefit your business.\n\n#ProductLaunch #Innovation #BusinessSolutions`;
        setLinkedinText(generatedText);
        toast.success("LinkedIn post content generated!");
      }
      
      setIsGeneratingText(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${platform} text copied to clipboard!`);
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
          <div className="col-span-5 p-6 border-r border-gray-800">
            <div className="max-w-xl mx-auto">
              <h1 className="text-sm font-bold text-white mb-6 text-center">Create Image that sells your product</h1>
              
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
                      
                      <div 
                        className={`flex items-center justify-center h-16 border-2 border-dashed border-gray-700 rounded-md mb-6 ${isUploading ? 'opacity-70' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        {!productImage ? (
                          <div className="text-center">
                            <Upload size={16} className="text-gray-600 mx-auto mb-1" />
                            <p className="text-gray-400 text-xs">Drop your product image here or</p>
                            <Button 
                              className="mt-1 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-0.5 h-5"
                              onClick={handleUploadButtonClick}
                              disabled={isUploading}
                            >
                              Upload Image
                            </Button>
                            {isUploading && (
                              <p className="text-xs text-blue-500 mt-1">Sending to webhook...</p>
                            )}
                            <Input 
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={URL.createObjectURL(productImage)} 
                              alt="Product" 
                              className="max-h-full max-w-full object-contain" 
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 rounded-full h-5 w-5"
                              onClick={() => setProductImage(null)}
                              disabled={isUploading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center mt-5">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 px-6 h-8 text-sm"
                          disabled={!productImage || !prompt.trim() || isUploading}
                        >
                          <ArrowUp className="mr-1 h-3.5 w-3.5" />
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
                      
                      <div 
                        className={`flex items-center justify-center h-16 border-2 border-dashed border-gray-700 rounded-md mb-6 ${isUploading ? 'opacity-70' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        {!productImage ? (
                          <div className="text-center">
                            <Upload size={16} className="text-gray-600 mx-auto mb-1" />
                            <p className="text-gray-400 text-xs">Drop your product image here or</p>
                            <Button 
                              className="mt-1 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-0.5 h-5"
                              onClick={handleUploadButtonClick}
                              disabled={isUploading}
                            >
                              Upload Image
                            </Button>
                            {isUploading && (
                              <p className="text-xs text-blue-500 mt-1">Sending to webhook...</p>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={URL.createObjectURL(productImage)} 
                              alt="Product" 
                              className="max-h-full max-w-full object-contain" 
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 rounded-full h-5 w-5"
                              onClick={() => setProductImage(null)}
                              disabled={isUploading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center mt-5">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 px-6 h-8 text-sm"
                          disabled={!productImage || !prompt.trim() || isUploading}
                        >
                          <ArrowUp className="mr-1 h-3.5 w-3.5" />
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
                      <div className="mb-4">
                        <Textarea 
                          placeholder="Enter details about your product for X post generation..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
                          rows={3}
                        />
                      </div>
                      
                      <div className="text-center mb-4 text-sm text-gray-400">
                        <p>Upload image functionality is disabled for X posts</p>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 px-6 h-8 text-sm mb-4"
                          disabled={!prompt.trim() || isGeneratingText}
                          onClick={() => generateTextContent("x")}
                        >
                          {isGeneratingText ? "Generating..." : "Generate X Post"}
                        </Button>
                      </div>
                      
                      {xText && (
                        <div className="mt-4 bg-gray-800 p-3 rounded-md relative">
                          <p className="text-white text-sm">{xText}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => copyToClipboard(xText, "X")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="linkedin" className="mt-6">
                    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
                      <div className="mb-4">
                        <Textarea 
                          placeholder="Enter details about your product for LinkedIn post generation..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
                          rows={3}
                        />
                      </div>
                      
                      <div className="text-center mb-4 text-sm text-gray-400">
                        <p>Upload image functionality is disabled for LinkedIn posts</p>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 px-6 h-8 text-sm mb-4"
                          disabled={!prompt.trim() || isGeneratingText}
                          onClick={() => generateTextContent("linkedin")}
                        >
                          {isGeneratingText ? "Generating..." : "Generate LinkedIn Post"}
                        </Button>
                      </div>
                      
                      {linkedinText && (
                        <div className="mt-4 bg-gray-800 p-3 rounded-md relative">
                          <p className="text-white text-sm whitespace-pre-line">{linkedinText}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => copyToClipboard(linkedinText, "LinkedIn")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          <div className="col-span-7 grid grid-cols-12 gap-0 h-screen">
            <div className="col-span-6 p-4 overflow-hidden max-h-screen">
              <div className="grid grid-cols-1 gap-5 animate-feed-scroll scrollbar-hide">
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
            
            <div className="col-span-6 p-4 overflow-hidden max-h-screen">
              <div className="grid grid-cols-1 gap-5 animate-story-scroll scrollbar-hide">
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
    </AuroraBackground>
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
    src: "/lovable-uploads/f87f82c8-bda2-4268-9607-11b99cf94970.png",
    alt: "Hot Spicy Pizza - Square format"
  },
  {
    src: "/lovable-uploads/f06d046c-9571-47f7-a1d2-f5ed72ae9768.png",
    alt: "Stay Hydrated - Square format"
  },
  {
    src: "/lovable-uploads/6534ea8a-5ce6-4f1d-af20-f5a89ce0423d.png",
    alt: "Elegant House - Square format"
  },
  {
    src: "/lovable-uploads/bbbcc7ce-8b51-43d4-be3c-d397f82d9b4b.png",
    alt: "Earth Hour - Square format"
  },
  {
    src: "/lovable-uploads/9d701c54-3390-4b75-bb0d-7ea9611529de.png",
    alt: "Borcelle Restaurant - Square format"
  },
  {
    src: "/lovable-uploads/5a1b8cd4-8cf8-49bd-ac67-491059107a73.png",
    alt: "Sneakers Store - Square format"
  },
  {
    src: "/lovable-uploads/02930cb5-a761-467a-ae52-3371e487ea28.png",
    alt: "Lumivera Radiant Serum - Square format"
  },
  {
    src: "/lovable-uploads/6a4e3dc1-1f68-4eac-8b1a-2a6fed380c48.png",
    alt: "Explore Thailand - Square format"
  }
];

const storyImages = [
  {
    src: "/lovable-uploads/3eaf26ea-5c41-4dd6-a936-da3761e1df91.png",
    alt: "Chocolate Day - Story format"
  },
  {
    src: "/lovable-uploads/3fa891d0-1948-405a-b714-7daf1546dc4c.png",
    alt: "Cocktail Party - Story format"
  },
  {
    src: "/lovable-uploads/289029a1-ce4b-41b2-850c-010597e88425.png",
    alt: "2024 New Arrival - Story format"
  },
  {
    src: "/lovable-uploads/78ed681f-31a7-4aa3-8327-9b2fcff0d589.png",
    alt: "Coming Soon - Story format"
  },
  {
    src: "/lovable-uploads/4566da4e-dcd6-43f1-8b1a-8f086bbbf049.png",
    alt: "We Are Brewing - Story format"
  },
  {
    src: "/lovable-uploads/d5259be9-2c46-4118-8dae-0b7a5ee45cbe.png",
    alt: "Delicious Ice Cream - Story format"
  },
  {
    src: "/lovable-uploads/12bfd206-826f-465e-bcc7-458b0aa560d9.png",
    alt: "Pastries - Story format"
  },
];

export default Index;

