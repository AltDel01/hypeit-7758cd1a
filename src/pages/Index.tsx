
import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { toast } from "sonner";
import TabsContainer from '@/components/tabs/TabsContainer';
import ImageGallery from '@/components/gallery/ImageGallery';
import { feedImages, storyImages } from '@/data/galleryImages';
import { useAuth } from '@/contexts/AuthContext';
import AvaButton from '@/components/audio/AvaButton';
import imageRequestService from '@/services/ImageRequestService';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const savedPrompt = localStorage.getItem('savedPrompt');
    if (savedPrompt && !prompt) {
      setPrompt(savedPrompt);
    }
    
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
  
  // Listen for image generation events from the admin panel
  useEffect(() => {
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("Index.tsx caught image generated event:", event.detail);
      setGeneratedImage(event.detail.imageUrl);
      setIsGenerating(false);
      toast.success("Your image has been generated!");
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, []);

  // Check for completed requests when the component mounts
  useEffect(() => {
    if (user) {
      const latestRequest = imageRequestService.getLatestRequestForUser(user.uid);
      if (latestRequest && latestRequest.status === 'completed' && latestRequest.resultImage) {
        setGeneratedImage(latestRequest.resultImage);
      }
    }
  }, [user]);
  
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    if (!user) {
      toast.error("Please log in to generate images");
      localStorage.setItem('authRedirectPath', '/');
      localStorage.setItem('savedPrompt', prompt);
      return;
    }
    
    setIsGenerating(true);
    try {
      const aspectRatio = activeTab === "feed" ? "1:1" : "9:16";
      console.log(`Generating image with aspect ratio: ${aspectRatio}`);
      console.log(`Product image available: ${productImage !== null}`);
      
      let productImageUrl = null;
      
      if (productImage) {
        console.log(`Product image: ${productImage.name}, size: ${productImage.size}`);
        // In a real app, you would upload the productImage to your server or cloud storage
        // For this example, we'll create a temporary object URL
        productImageUrl = URL.createObjectURL(productImage);
      }
      
      Sentry.setContext("image_generation", {
        prompt: prompt,
        aspectRatio: aspectRatio,
        hasProductImage: productImage !== null,
        timestamp: new Date().toISOString()
      });
      
      // Create the image generation request
      const request = imageRequestService.createRequest(
        user.uid,
        user.displayName || user.email || 'Anonymous User',
        prompt,
        aspectRatio,
        productImageUrl
      );
      
      console.log("Image generation request created:", request);
      
      // Start simulating progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) {
          progress = 95; // Cap at 95% until completed
          clearInterval(interval);
        }
        
        // Trigger an event to update the progress
        const progressEvent = new CustomEvent('imageGenerationProgress', {
          detail: { progress }
        });
        window.dispatchEvent(progressEvent);
      }, 800);
      
      // Notify the user that their request has been sent
      toast.success("Your image generation request has been sent to our designers!");
      toast.info("You'll receive a notification when your image is ready.");
      
    } catch (error) {
      console.error("Error generating image:", error);
      Sentry.captureException(error);
      toast.error(`Failed to submit request: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
          <div className="col-span-5 p-6">
            <div className="max-w-xl mx-auto">
              <h1 className="text-4xl mb-6 text-center leading-tight text-[#8c52ff] font-extrabold md:font-extrabold [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] md:[text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
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
        
        <AvaButton />
      </div>
    </AuroraBackground>
  );
};

export default Index;
