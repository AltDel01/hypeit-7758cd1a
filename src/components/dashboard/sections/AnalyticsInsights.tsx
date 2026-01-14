import React, { useState } from 'react';
import { Instagram, Youtube, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InstagramAnalyticsDashboard from '@/components/virality/sections/social-media-analytics/InstagramAnalyticsDashboard';
import EndeavorIndoDashboard from '@/components/virality/sections/social-media-analytics/EndeavorIndoDashboard';
import LlamaInsightsPanel from '@/components/virality/sections/social-media-analytics/LlamaInsightsPanel';
import ShowDataFilter from '@/components/virality/sections/social-media-analytics/ShowDataFilter';
import { showDataOptions } from '@/components/virality/sections/social-media-analytics/constants';

const AnalyticsInsights = () => {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [usernames, setUsernames] = useState<string[]>(['', '', '']);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardUsername, setDashboardUsername] = useState('');
  const [selectedDataOptions, setSelectedDataOptions] = useState<string[]>(showDataOptions);
  const [showDataDropdownOpen, setShowDataDropdownOpen] = useState(false);

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleUsernameChange = (index: number, value: string) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value;
    setUsernames(newUsernames);
  };

  const toggleDataOption = (option: string) => {
    setSelectedDataOptions(current => {
      if (current.includes(option)) {
        return current.filter(item => item !== option);
      } else {
        return [...current, option];
      }
    });
  };

  const renderPlatformIcon = (platformType: 'instagram' | 'tiktok' | 'youtube') => {
    switch (platformType) {
      case 'instagram':
        return <Instagram className="h-6 w-6 text-pink-500" />;
      case 'tiktok':
        return (
          <img 
            src="/lovable-uploads/b847337c-33aa-4f13-ad9d-b555c0abcb78.png" 
            alt="TikTok" 
            className="h-6 w-6"
          />
        );
      case 'youtube':
        return <Youtube className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
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
        
        {/* 2-Column Layout: Report (Left) + AI Insights (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Analytics Report (2/3 width) */}
          <div className="lg:col-span-2">
            {cleanUsername === 'endeavor_indo' ? (
              <EndeavorIndoDashboard username={dashboardUsername} />
            ) : (
              <InstagramAnalyticsDashboard username={dashboardUsername} />
            )}
          </div>
          
          {/* Right Column - AI Insights Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <LlamaInsightsPanel username={dashboardUsername} platform={platform} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 animate-gradient-text">
          Analytics & Insights
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Track performance with AI-powered insights
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2 sm:gap-3">
        <ShowDataFilter 
          showDataOptions={showDataOptions}
          selectedDataOptions={selectedDataOptions}
          showDataDropdownOpen={showDataDropdownOpen}
          setShowDataDropdownOpen={setShowDataDropdownOpen}
          toggleDataOption={toggleDataOption}
        />

        <Select>
          <SelectTrigger className="w-full sm:w-auto bg-transparent border border-purple-500/30 text-white focus:ring-purple-600 hover:bg-purple-600/20">
            <SelectValue placeholder="Select Mode" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="simple" className="hover:bg-purple-600/20">Simple Mode</SelectItem>
            <SelectItem value="advanced" className="hover:bg-purple-600/20">Advanced Mode</SelectItem>
            <SelectItem value="expert" className="hover:bg-purple-600/20">Expert Mode</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-transparent border border-purple-500/30 text-white justify-between hover:bg-purple-600/20 focus:ring-purple-600"
            >
              More Action
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background/95 backdrop-blur-sm">
            <DropdownMenuItem className="hover:bg-purple-600/20">Export Data</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-purple-600/20">Share Report</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-purple-600/20">Schedule Analysis</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Platform Selection Tabs - Border Bottom Style */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex justify-start border-b border-gray-700 pb-2 overflow-x-auto scrollbar-hide">
          {['instagram', 'tiktok', 'youtube'].map((platformType) => (
            <button
              key={platformType}
              className={`flex items-center space-x-2 md:space-x-3 pb-3 px-4 md:px-10 first:pl-0 font-medium text-sm md:text-lg transition-colors whitespace-nowrap ${
                platform === platformType 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setPlatform(platformType as 'instagram' | 'tiktok' | 'youtube')}
            >
              <div className="flex items-center gap-2 md:gap-3">
                {renderPlatformIcon(platformType as 'instagram' | 'tiktok' | 'youtube')}
                <span className="hidden sm:inline">{platformType.charAt(0).toUpperCase() + platformType.slice(1)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Username Input Fields */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
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
    </div>
  );
};

export default AnalyticsInsights;
