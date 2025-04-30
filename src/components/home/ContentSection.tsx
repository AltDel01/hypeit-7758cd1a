
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabsContainer from '@/components/tabs/TabsContainer';

const ContentSection: React.FC = () => {
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
    const handleImageGenerated = (event: CustomEvent) => {
      console.log("ContentSection caught image generated event:", event.detail);
      setGeneratedImage(event.detail.imageUrl);
      setIsGenerating(false);
    };
    
    window.addEventListener('imageGenerated', handleImageGenerated as EventListener);
    
    return () => {
      window.removeEventListener('imageGenerated', handleImageGenerated as EventListener);
    };
  }, []);

  return (
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
            generateImage={useImageGenerator(prompt, productImage, user, activeTab, setIsGenerating)}
            setXText={setXText}
            setLinkedinText={setLinkedinText}
            generatedImage={generatedImage}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
