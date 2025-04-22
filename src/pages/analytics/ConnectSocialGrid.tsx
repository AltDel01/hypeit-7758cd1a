
import React from 'react';
import SocialConnectCard from './SocialConnectCard';
import { Instagram, Linkedin } from 'lucide-react';

interface ConnectSocialGridProps {
  onTrigger: (feature: string) => void;
}

const ConnectSocialGrid = ({ onTrigger }: ConnectSocialGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
    <SocialConnectCard 
      platform="Instagram"
      icon={<Instagram className="h-8 w-8 text-pink-500" />}
      onConnect={() => onTrigger('instagram')}
    />
    <SocialConnectCard 
      platform="LinkedIn"
      icon={<Linkedin className="h-8 w-8 text-blue-700" />}
      onConnect={() => onTrigger('linkedin')}
    />
  </div>
);

export default ConnectSocialGrid;

