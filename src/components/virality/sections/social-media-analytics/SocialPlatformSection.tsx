
import React from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SocialPlatformSectionProps {
  platform: 'instagram' | 'tiktok' | 'youtube';
}

const SocialPlatformSection: React.FC<SocialPlatformSectionProps> = ({ platform }) => {
  const renderIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'tiktok':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/b847337c-33aa-4f13-ad9d-b555c0abcb78.png" 
              alt="TikTok" 
              className="w-5 h-5"
            />
          </div>
        );
      case 'youtube':
        return <Youtube className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {renderIcon()}
        <h2 className="text-xl font-semibold text-white">{getPlatformName()}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <div key={`${platform}-${index}`} className="relative">
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
  );
};

export default SocialPlatformSection;
