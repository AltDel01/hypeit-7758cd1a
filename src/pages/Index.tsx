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
import { imageRequestService } from '@/services/requests';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xText, setXText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    if (user) {
      const latestRequest = imageRequestService.getLatestRequestForUser(user.id);
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
        productImageUrl = URL.createObjectURL(productImage);
      }
      
      Sentry.setContext("image_generation", {
        prompt: prompt,
        aspectRatio: aspectRatio,
        hasProductImage: productImage !== null,
        timestamp: new Date().toISOString()
      });
      
      // Get the batch size from local storage (set by VisualSettings)
      const batchSize = parseInt(localStorage.getItem('selectedImagesPerBatch') || '1', 10);
      const isPremiumBatch = batchSize > 3;
      
      // Create request in the service
      const request = imageRequestService.createRequest(
        user.id,
        user.email || 'Anonymous User',
        prompt,
        aspectRatio,
        productImageUrl,
        batchSize
      );
      
      console.log("Image generation request created:", request);
      
      // Start progress simulation for user feedback
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) {
          progress = 95;
          clearInterval(interval);
        }
        
        const progressEvent = new CustomEvent('imageGenerationProgress', {
          detail: { progress, requestId: request.id }
        });
        window.dispatchEvent(progressEvent);
      }, 800);
      
      // For premium batches (15 or 25 images), immediately navigate to Analytics > Generated Content
      if (isPremiumBatch) {
        // No toast notification - just immediately redirect
        navigate('/analytics');
        
        // Add a small delay to allow the page to load before setting the active section
        setTimeout(() => {
          const event = new CustomEvent('setAnalyticsSection', { 
            detail: { section: 'generated' } 
          });
          window.dispatchEvent(event);
        }, 500);
      } else {
        toast.success("Your image generation request has been sent to our designers!");
        toast.info("You'll receive a notification when your image is ready.");
      }
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
              <h1 className="text-3xl md:text-4xl mb-4 text-center leading-tight 
                            text-[#8c52ff] font-extrabold 
                            tracking-tight
                            md:font-extrabold 
                            [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] 
                            md:[text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                Create One Month Social Media Content in Seconds<br />
              </h1>
              
              <div className="mb-4">
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
