
import React from 'react';
import { Instagram, Youtube, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SocialMediaAnalytics: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Social Media Analytics</h1>
      <p className="text-gray-400 mb-8">
        Connect your social media accounts to track performance across platforms.
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
            <Music className="w-6 h-6 text-white" />
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
    </div>
  );
};

export default SocialMediaAnalytics;
