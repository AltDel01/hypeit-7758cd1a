
import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { toast } from "sonner";
import TabsContainer from '@/components/tabs/TabsContainer';
import ImageGallery from '@/components/gallery/ImageGallery';
import GeminiImageService from '@/services/GeminiImageService';
import { feedImages, storyImages } from '@/data/galleryImages';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Restore prompt from localStorage when component mounts or user logs in
  useEffect(() => {
    const savedPrompt = localStorage.getItem('savedPrompt');
    if (savedPrompt && !prompt) {
      setPrompt(savedPrompt);
    }
    
    // Check if we redirected from auth and should clear saved path
    if (user && localStorage.getItem('authRedirectPath') === '/') {
      localStorage.removeItem('authRedirectPath');
    }
  }, [user]);
  
  useEffect(() => {
    Sentry.setUser({
      id: "example-user-id",
      email: "example@user.com",
      username: "exampleUser"
    });
    
    Sentry.setTag("page", "index");
    Sentry.setTag("feature", "image-generation");
  }, []);
  
  // Listen for imageGenerated events
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("Index.tsx caught image generated event:", event.detail);
      setGeneratedImage(event.detail.imageUrl);
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
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
      console.log(`Product image available: ${productImage !== null}`);
      
      // Log product image details if available
      if (productImage) {
        console.log(`Product image: ${productImage.name}, size: ${productImage.size}`);
      }
      
      Sentry.setContext("image_generation", {
        prompt: prompt,
        aspectRatio: aspectRatio,
        hasProductImage: productImage !== null,
        timestamp: new Date().toISOString()
      });
      
      // Update prompt to include reference to the product image if one is uploaded
      let enhancedPrompt = prompt;
      if (productImage) {
        enhancedPrompt += ` - Create an image that features this product prominently.`;
      }
      
      const imageUrl = await GeminiImageService.generateImage({
        prompt: enhancedPrompt,
        aspectRatio,
        style: productImage ? "product-focused" : undefined,
        productImage // Pass the product image to the service
      });
      
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
          <div className="col-span-5 p-6">
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
                  generateImage={generateImage}
                  setXText={setXText}
                  setLinkedinText={setLinkedinText}
                  generatedImage={generatedImage}
                />
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
