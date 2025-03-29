
import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { toast } from "sonner";
import TabsContainer from '@/components/tabs/TabsContainer';
import ImageGallery from '@/components/gallery/ImageGallery';
import GeminiImageService from '@/services/GeminiImageService';
import { feedImages, storyImages } from '@/data/galleryImages';
import ErrorButton from '@/components/error/ErrorButton';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Set user context for Sentry (usually done after authentication)
  useEffect(() => {
    // This would typically use actual user data from your auth system
    Sentry.setUser({
      id: "example-user-id",
      email: "example@user.com",
      username: "exampleUser"
    });
    
    // Set extra context that might be useful
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
      const aspectRatio = activeTab === "feed" ? "1:1" : "9:16";
      console.log(`Generating image with aspect ratio: ${aspectRatio}`);
      
      // Set context for the current operation
      Sentry.setContext("image_generation", {
        prompt: prompt,
        aspectRatio: aspectRatio,
        timestamp: new Date().toISOString()
      });
      
      const imageUrl = await GeminiImageService.generateImage({
        prompt,
        aspectRatio,
      });
      
      if (imageUrl) {
        console.log(`Image generated, URL: ${imageUrl}`);
        setGeneratedImage(imageUrl);
      } else {
        console.error("No image URL returned from generation service");
        // Capture a handled exception
        Sentry.captureMessage("Image generation failed - No URL returned", "error");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Capture the exception
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
              <h1 className="text-sm font-bold text-white mb-6 text-center">Create AI Branding Image</h1>
              
              <div className="mb-6">
                <TabsContainer 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  productImage={productImage}
                  setProductImage={setProductImage}
                  isGenerating={isGenerating}
                  generateImage={generateImage}
                  setXText={setXText}
                  setLinkedinText={setLinkedinText}
                />
              </div>
              
              {/* Error Button for testing Sentry */}
              <div className="flex justify-center mt-6">
                <ErrorButton />
              </div>
            </div>
          </div>
          
          <ImageGallery 
            feedImages={feedImages}
            storyImages={storyImages}
            generatedImage={generatedImage}
            activeTab={activeTab}
          />
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Index;
