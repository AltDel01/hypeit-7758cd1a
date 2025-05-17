
import React, { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const SocialMediaAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleReset = () => {
    // Reset functionality would go here
    console.log('Reset clicked');
    // You could add code to clear all inputs
  };
  
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    console.log('Analyze clicked');
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };
  
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Social Media Analytics</h1>
      <p className="text-gray-400 mb-8">
        Put social media handler to show account performance
      </p>
      
      <div className="space-y-8">
        {/* Instagram Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold text-white">Instagram</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={`instagram-${index}`} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <Input 
                  placeholder="Enter username" 
                  className="pl-8 bg-background/50 border-gray-700"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* TikTok Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <img 
                src="/lovable-uploads/b847337c-33aa-4f13-ad9d-b555c0abcb78.png" 
                alt="TikTok" 
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-semibold text-white">TikTok</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={`tiktok-${index}`} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <Input 
                  placeholder="Enter username" 
                  className="pl-8 bg-background/50 border-gray-700"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* YouTube Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Youtube</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={`youtube-${index}`} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <Input 
                  placeholder="Enter username" 
                  className="pl-8 bg-background/50 border-gray-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Adding Reset and Analyze buttons */}
      <div className="mt-8 flex gap-4">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="px-8 py-2 text-base border-gray-600 hover:bg-gray-800 hover:text-white"
        >
          Reset
        </Button>
        <Button 
          variant="newPurple" 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-8 py-2 text-base"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaAnalytics;
