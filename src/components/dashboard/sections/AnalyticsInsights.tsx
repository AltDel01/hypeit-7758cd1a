import React, { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstagramAnalyticsDashboard from '@/components/virality/sections/social-media-analytics/InstagramAnalyticsDashboard';
import EndeavorIndoDashboard from '@/components/virality/sections/social-media-analytics/EndeavorIndoDashboard';
import LlamaInsightsPanel from '@/components/virality/sections/social-media-analytics/LlamaInsightsPanel';

const AnalyticsInsights = () => {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
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
    
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground">
              Track performance with AI-powered insights from social media
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleBackToInputs}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back to Input
          </Button>
        </div>
        
        {/* 2-Column Layout: Report (Left) + LLama Insights (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Analytics Report (2/3 width) */}
          <div className="lg:col-span-2">
            {cleanUsername === 'endeavor_indo' ? (
              <EndeavorIndoDashboard username={dashboardUsername} />
            ) : (
              <InstagramAnalyticsDashboard username={dashboardUsername} />
            )}
          </div>
          
          {/* Right Column - LLama Insights Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <LlamaInsightsPanel username={dashboardUsername} platform={platform} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground">
          Track performance with AI-powered insights from Meta, TikTok, YouTube, and Instagram
        </p>
      </div>

      {/* Platform Selection Tabs */}
      <Tabs defaultValue="instagram" onValueChange={(value) => setPlatform(value as 'instagram' | 'tiktok' | 'youtube')}>
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-background/60 border border-slate-700">
          <TabsTrigger value="instagram" className="data-[state=active]:bg-purple-600/20">
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-purple-600/20">
            TikTok
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-purple-600/20">
            <Youtube className="w-4 h-4 mr-2" />
            YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value={platform} className="space-y-4 mt-6">
          {/* Username Input Fields */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsInsights;
