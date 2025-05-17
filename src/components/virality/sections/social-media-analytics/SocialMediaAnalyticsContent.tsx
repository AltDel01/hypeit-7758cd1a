
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import FilterButtons from './FilterButtons';
import ActionButtons from './ActionButtons';
import SocialPlatformSection from './SocialPlatformSection';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <h2 className="text-2xl font-semibold text-white">Social Media Analytics</h2>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="bg-transparent border border-gray-700 text-white hover:bg-gray-800"
          >
            Connect Account
          </Button>
          <Button 
            variant="newPurple"
          >
            Import Data
          </Button>
        </div>
      </div>

      <FilterButtons 
        showDataOptions={showDataOptions}
        selectedDataOptions={selectedDataOptions}
        showDataDropdownOpen={showDataDropdownOpen}
        setShowDataDropdownOpen={setShowDataDropdownOpen}
        toggleDataOption={toggleDataOption}
      />

      <div className="space-y-6">
        <div className="flex space-x-4 border-b border-gray-700 pb-2">
          {['instagram', 'tiktok', 'youtube'].map((platform) => (
            <button
              key={platform}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${
                selectedPlatform === platform 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setSelectedPlatform(platform as 'instagram' | 'tiktok' | 'youtube')}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>

        <SocialPlatformSection platform={selectedPlatform} />
      </div>
      
      <ActionButtons 
        isResetActive={isResetActive}
        isAnalyzing={isAnalyzing}
        isAnalyzeDisabled={isAnalyzeDisabled}
        handleReset={handleReset}
        handleAnalyze={handleAnalyze}
      />
    </div>
  );
};

export default SocialMediaAnalyticsContent;
