
import React, { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InstagramAnalyticsDashboard from './InstagramAnalyticsDashboard';

interface SocialPlatformSectionProps {
  platform: 'instagram' | 'tiktok' | 'youtube';
}

const SocialPlatformSection: React.FC<SocialPlatformSectionProps> = ({ platform }) => {
  const [usernames, setUsernames] = useState<string[]>(['', '', '']);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardUsername, setDashboardUsername] = useState('');

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleUsernameChange = (index: number, value: string) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value;
    setUsernames(newUsernames);
  };

  const handleAnalyze = () => {
    // Check if any username is "innovation.ui"
    const targetUsername = usernames.find(username => 
      username.toLowerCase().trim() === 'innovation.ui'
    );
    
    if (targetUsername && platform === 'instagram') {
      setDashboardUsername(targetUsername);
      setShowDashboard(true);
    }
  };

  const handleBackToInputs = () => {
    setShowDashboard(false);
    setDashboardUsername('');
  };

  if (showDashboard && platform === 'instagram') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToInputs}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back to Input
          </Button>
        </div>
        <InstagramAnalyticsDashboard username={dashboardUsername} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <div key={`${platform}-${index}`} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-400">@</span>
            </div>
            <Input 
              placeholder="Enter username" 
              className="pl-8 bg-background/50 border-gray-700"
              value={usernames[index - 1]}
              onChange={(e) => handleUsernameChange(index - 1, e.target.value)}
            />
          </div>
        ))}
      </div>
      
      {usernames.some(username => username.trim() !== '') && (
        <div className="flex justify-end">
          <Button 
            onClick={handleAnalyze}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Analyze {getPlatformName()} Profiles
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialPlatformSection;
