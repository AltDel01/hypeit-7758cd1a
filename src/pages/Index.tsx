
import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { toast } from "sonner";
import TabsContainer from '@/components/tabs/TabsContainer';
import ImageDisplay from '@/components/tabs/ImageDisplay';
import { feedImages, storyImages } from '@/data/galleryImages';
import { generateImageWithWebhook } from '@/utils/image/webhookHandler';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  useEffect(() => {
    Sentry.setUser({
      id: "example-user-id",
      email: "example@user.com",
      username: "exampleUser"
    });
    
    Sentry.setTag("page", "index");
    Sentry.setTag("feature", "image-generation");
  }, []);
  
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log(`Generating image with prompt: ${prompt}`);
      console.log(`Product image available: ${productImage !== null}`);
      
      // Log product image details if available
      if (productImage) {
        console.log(`Product image: ${productImage.name}, size: ${productImage.size}`);
      }
      
      Sentry.setContext("image_generation", {
        prompt: prompt,
        hasProductImage: productImage !== null,
        timestamp: new Date().toISOString()
      });
      
      // Generate image with webhook
      const imageUrl = await generateImageWithWebhook(prompt, productImage);
      
      if (imageUrl) {
        console.log(`Image generated, URL: ${imageUrl}`);
        setGeneratedImage(imageUrl);
        toast.success("Image generated successfully!");
      } else {
        console.error("No image URL returned from generation service");
        Sentry.captureMessage("Image generation failed - No URL returned", "error");
        toast.error("Failed to generate image - no URL returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Sentry.captureException(error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
          <div className="col-span-5 p-6 border-r border-gray-800">
            <div className="max-w-xl mx-auto">
              <h1 className="text-4xl font-black mb-6 text-center leading-tight animate-gradient-text animate-fade-in-up">
                Create One Month Social Media<br />Content Within Minutes
              </h1>
              
              <div className="mb-6">
                <TabsContainer 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  productImage={productImage}
                  setProductImage={setProductImage}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  generateImage={generateImage}
                  setXText={setXText}
                  setLinkedinText={setLinkedinText}
                  generatedImage={generatedImage}
                  setGeneratedImage={setGeneratedImage}
                />
              </div>
            </div>
          </div>
          
          <div className="col-span-7 grid grid-cols-12 gap-0 h-screen">
            <div className="col-span-6 p-4 overflow-hidden max-h-screen">
              <ImageDisplay 
                images={feedImages}
                generatedImage={generatedImage}
                showGenerated={activeTab === "feed"}
                aspectRatio="square"
              />
            </div>
            
            <div className="col-span-6 p-4 overflow-hidden max-h-screen">
              <ImageDisplay 
                images={storyImages}
                generatedImage={generatedImage}
                showGenerated={activeTab === "story"}
                aspectRatio="story"
              />
            </div>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Index;
