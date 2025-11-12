
import React, { useState } from 'react';
import FilterButtons from './FilterButtons';
import SocialPlatformSection from './SocialPlatformSection';
import { Instagram, Youtube } from 'lucide-react';

interface SocialMediaAnalyticsContentProps {
  showDataOptions: string[];
  selectedDataOptions: string[];
  showDataDropdownOpen: boolean;
  setShowDataDropdownOpen: (isOpen: boolean) => void;
  toggleDataOption: (option: string) => void;
  isResetActive: boolean;
  isAnalyzing: boolean;
  isAnalyzeDisabled: boolean;
  handleReset: () => void;
  handleAnalyze: () => void;
}

const SocialMediaAnalyticsContent: React.FC<SocialMediaAnalyticsContentProps> = ({
  showDataOptions,
  selectedDataOptions,
  showDataDropdownOpen,
  setShowDataDropdownOpen,
  toggleDataOption,
  isResetActive,
  isAnalyzing,
  isAnalyzeDisabled,
  handleReset,
  handleAnalyze
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');

  const renderPlatformIcon = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    switch (platform) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <h2 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Social Media Analytics</h2>
      </div>

      <FilterButtons 
        showDataOptions={showDataOptions}
        selectedDataOptions={selectedDataOptions}
        showDataDropdownOpen={showDataDropdownOpen}
        setShowDataDropdownOpen={setShowDataDropdownOpen}
        toggleDataOption={toggleDataOption}
      />

      <div className="space-y-6">
        <div className="flex justify-start border-b border-gray-700 pb-2">
          {['instagram', 'tiktok', 'youtube'].map((platform) => (
            <button
              key={platform}
              className={`flex items-center space-x-3 pb-3 px-10 first:pl-0 font-medium text-lg transition-colors ${
                selectedPlatform === platform 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setSelectedPlatform(platform as 'instagram' | 'tiktok' | 'youtube')}
            >
              <div className="flex items-center gap-3">
                {renderPlatformIcon(platform as 'instagram' | 'tiktok' | 'youtube')}
                <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
              </div>
            </button>
          ))}
        </div>

        <SocialPlatformSection platform={selectedPlatform} />
      </div>
      
      <div className="flex justify-between pt-4">
        <div>
          {isResetActive && (
            <button
              onClick={handleReset}
              className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 px-4 py-2 rounded"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAnalyticsContent;
