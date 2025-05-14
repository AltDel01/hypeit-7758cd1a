
import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
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
      // Image generation is disabled, so we don't update the state
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
        // Don't set generated image as feature is disabled
      }
    }
  }, [user]);
  
  const generateImage = async () => {
    // Image generation is disabled
    console.log("Image generation is disabled");
    return;
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
            generatedImage={null} // Always pass null to prevent showing any generated images
            activeTab={activeTab}
          />
        </main>
        
        <AvaButton />
      </div>
    </AuroraBackground>
  );
};

export default Index;
