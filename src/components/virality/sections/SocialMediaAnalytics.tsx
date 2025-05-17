
import React, { useState } from 'react';
import { Instagram, Youtube, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SocialMediaAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isAnalyzeDisabled, setIsAnalyzeDisabled] = useState(false);
  
  const handleReset = () => {
    setIsResetActive(true);
    setIsAnalyzeDisabled(true); // Disable the analyze button when reset is clicked
    console.log('Reset clicked');
    
    // Simulate reset process
    setTimeout(() => {
      setIsResetActive(false);
      
      // Keep analyze button disabled for a bit longer to indicate reset is still processing
      setTimeout(() => {
        setIsAnalyzeDisabled(false);
      }, 1000);
      
      // You could add code to clear all inputs
    }, 500); // Return to original state after 500ms
  };
  
  const handleAnalyze = () => {
    if (isAnalyzeDisabled) return; // Prevent clicking if disabled
    
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
      <p className="text-gray-400 mb-4">
        Put social media handler to show account performance
      </p>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Select>
          <SelectTrigger className="w-36 bg-transparent border border-gray-700 text-white">
            <SelectValue placeholder="Show Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Data</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
            <SelectItem value="reach">Reach</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-36 bg-transparent border border-gray-700 text-white">
            <SelectValue placeholder="Select Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple Mode</SelectItem>
            <SelectItem value="advanced">Advanced Mode</SelectItem>
            <SelectItem value="expert">Expert Mode</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-36 bg-transparent border-gray-700 text-white justify-between">
              More Action
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
            <DropdownMenuItem>Share Report</DropdownMenuItem>
            <DropdownMenuItem>Schedule Analysis</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="newPurple" className="w-36 justify-between">
              Compare
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>With Previous Month</DropdownMenuItem>
            <DropdownMenuItem>With Competitors</DropdownMenuItem>
            <DropdownMenuItem>Industry Average</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
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
      
      {/* Adding Reset and Analyze buttons with equal width */}
      <div className="mt-8 flex gap-4">
        <Button 
          variant={isResetActive ? "newPurple" : "outline"} 
          onClick={handleReset}
          className={`w-32 h-12 text-base ${isResetActive ? '' : 'bg-black text-white border-black hover:bg-[#1A1F2C]'}`}
        >
          Reset
        </Button>
        <Button 
          variant={isAnalyzeDisabled ? "outline" : "newPurple"}
          onClick={handleAnalyze}
          disabled={isAnalyzing || isAnalyzeDisabled}
          className={`w-32 h-12 text-base ${isAnalyzeDisabled ? 'bg-black text-white border-black hover:bg-[#1A1F2C]' : ''}`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaAnalytics;
