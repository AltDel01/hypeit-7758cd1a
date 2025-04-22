
import React from 'react';
import SocialConnectCard from './SocialConnectCard';
import { Instagram, Linkedin } from 'lucide-react';

interface ConnectSocialGridProps {
  onTrigger: (feature: string) => void;
}

const ConnectSocialGrid = ({ onTrigger }: ConnectSocialGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    {/* X (with new logo) */}
    <SocialConnectCard 
      platform="X"
      icon={
        <img src="/lovable-uploads/modern-x.svg" alt="X Logo" className="h-8 w-8 invert" />
      }
      onConnect={() => onTrigger('x')}
    />
    {/* TikTok */}
    <SocialConnectCard 
      platform="TikTok"
      icon={
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path d="M19.589 6.686C19.5002 6.67221 19.4133 6.65041 19.33 6.621C18.1713 6.271 17.157 5.5945 16.4144 4.6715C15.6719 3.7486 15.2385 2.62708 15.179 1.456H11.334V15.989C11.334 16.2551 11.2815 16.5181 11.1798 16.7622C11.0781 17.0063 10.9295 17.226 10.7428 17.4081C10.556 17.5901 10.3345 17.7309 10.0885 17.824C9.8426 17.9172 9.5786 17.9605 9.31399 17.951C8.77355 17.9516 8.25353 17.7624 7.84719 17.4175C7.44085 17.0727 7.17543 16.5969 7.10199 16.072C7.02855 15.547 7.15266 15.0156 7.45244 14.5794C7.75222 14.1431 8.20769 13.8306 8.73499 13.703C8.83098 13.6787 8.93005 13.6661 9.02999 13.666V9.866C8.45899 9.866 7.89399 9.978 7.35899 10.19C6.42819 10.5649 5.63768 11.221 5.09454 12.0662C4.55139 12.9114 4.28024 13.9057 4.31999 14.916C4.35974 15.9263 4.70859 16.8994 5.3149 17.7023C5.92121 18.5052 6.75829 19.0998 7.71299 19.412C8.35399 19.623 9.01999 19.727 9.68399 19.727C10.3533 19.7269 11.0162 19.6126 11.643 19.3899C12.8571 18.9231 13.8609 18.0525 14.4767 16.929C15.0926 15.8055 15.2799 14.5022 15.004 13.26V7.636C15.8167 8.11371 16.7041 8.45697 17.632 8.65C18.1294 8.748 18.6348 8.81218 19.144 8.842V5.571C19.34 5.678 19.488 5.757 19.589 5.814V6.686Z" fill="currentColor"/>
        </svg>
      }
      onConnect={() => onTrigger('tiktok')}
    />
  </div>
);

export default ConnectSocialGrid;
