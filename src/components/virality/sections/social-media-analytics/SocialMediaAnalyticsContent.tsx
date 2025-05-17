
import React from 'react';
import SocialPlatformSection from './SocialPlatformSection';
import FilterButtons from './FilterButtons';
import ActionButtons from './ActionButtons';

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
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Social Media Analytics</h1>
      <p className="text-gray-400 mb-4">
        Put social media handler to show account performance
      </p>
      
      <FilterButtons 
        showDataOptions={showDataOptions}
        selectedDataOptions={selectedDataOptions}
        showDataDropdownOpen={showDataDropdownOpen}
        setShowDataDropdownOpen={setShowDataDropdownOpen}
        toggleDataOption={toggleDataOption}
      />
      
      <div className="space-y-8">
        <SocialPlatformSection platform="instagram" />
        <SocialPlatformSection platform="tiktok" />
        <SocialPlatformSection platform="youtube" />
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
