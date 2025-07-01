
import React, { useState, useEffect } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InstagramAnalyticsDashboard from './InstagramAnalyticsDashboard';
import EndeavorIndoDashboard from './EndeavorIndoDashboard';

interface SocialPlatformSectionProps {
  platform: 'instagram' | 'tiktok' | 'youtube';
}

const SocialPlatformSection: React.FC<SocialPlatformSectionProps> = ({ platform }) => {
  const [usernames, setUsernames] = useState<string[]>(['', '', '']);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardUsername, setDashboardUsername] = useState('');

  // Persist state in sessionStorage for better tab persistence
  useEffect(() => {
    console.log('Loading saved state for platform:', platform);
    const savedState = sessionStorage.getItem(`socialPlatform_${platform}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        console.log('Restored state:', parsed);
        if (parsed.usernames) setUsernames(parsed.usernames);
        if (parsed.showDashboard) setShowDashboard(parsed.showDashboard);
        if (parsed.dashboardUsername) setDashboardUsername(parsed.dashboardUsername);
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  }, [platform]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      usernames,
      showDashboard,
      dashboardUsername
    };
    console.log('Saving state to sessionStorage:', stateToSave);
    sessionStorage.setItem(`socialPlatform_${platform}`, JSON.stringify(stateToSave));
  }, [usernames, showDashboard, dashboardUsername, platform]);

  // Add visibility change listener to debug
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Tab visibility changed. Hidden:', document.hidden, 'showDashboard:', showDashboard);
      // Force save state when tab becomes hidden
      if (document.hidden) {
        const stateToSave = { usernames, showDashboard, dashboardUsername };
        sessionStorage.setItem(`socialPlatform_${platform}`, JSON.stringify(stateToSave));
        console.log('Force saved state on tab hide:', stateToSave);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showDashboard, usernames, dashboardUsername, platform]);

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleUsernameChange = (index: number, value: string) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value;
    setUsernames(newUsernames);
  };

  const handleAnalyze = () => {
    // Check for specific usernames
    const targetUsername = usernames.find(username => {
      const cleanUsername = username.toLowerCase().trim();
      return cleanUsername === 'innovation.ui' || cleanUsername === 'endeavor_indo';
    });
    
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
    const cleanUsername = dashboardUsername.toLowerCase().trim();
    
    if (cleanUsername === 'endeavor_indo') {
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
          <EndeavorIndoDashboard username={dashboardUsername} />
        </div>
      );
    } else {
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
