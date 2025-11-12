
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SocialConnectCardProps {
  platform: string;
  icon: React.ReactNode;
  onConnect: () => void;
}

const SocialConnectCard = ({ platform, icon, onConnect }: SocialConnectCardProps) => (
  <Card className="bg-gray-800 border-gray-700 p-6 flex flex-col items-center text-center">
    <div className="mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{platform}</h3>
    <p className="text-gray-400 text-sm mb-4">Connect your {platform} account to analyze performance and schedule posts.</p>
    <Button
      className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white mt-auto w-full"
      onClick={onConnect}
    >
      Connect {platform}
    </Button>
  </Card>
);

export default SocialConnectCard;
