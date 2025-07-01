
import React, { useState, useEffect } from 'react';
import { showDataOptions } from './social-media-analytics/constants';
import SocialMediaAnalyticsContent from './social-media-analytics/SocialMediaAnalyticsContent';
import { useAnalyticsActions } from './social-media-analytics/useAnalyticsActions';

const SocialMediaAnalytics: React.FC = () => {
  const [selectedDataOptions, setSelectedDataOptions] = useState<string[]>(showDataOptions);
  const [showDataDropdownOpen, setShowDataDropdownOpen] = useState(false);
  
  // Add state persistence for the analytics section
  const [platformStates, setPlatformStates] = useState<{[key: string]: any}>({});
  
  useEffect(() => {
    // Load all platform states on component mount
    const savedStates: {[key: string]: any} = {};
    ['instagram', 'tiktok', 'youtube'].forEach(platform => {
      const saved = localStorage.getItem(`socialPlatform_${platform}`);
      if (saved) {
        try {
          savedStates[platform] = JSON.parse(saved);
        } catch (error) {
          console.error(`Error parsing ${platform} state:`, error);
        }
      }
    });
    setPlatformStates(savedStates);
  }, []);
  
  const { 
    isAnalyzing, 
    isResetActive, 
    isAnalyzeDisabled, 
    handleReset, 
    handleAnalyze 
  } = useAnalyticsActions();

  const toggleDataOption = (option: string) => {
    setSelectedDataOptions(current => {
      if (current.includes(option)) {
        return current.filter(item => item !== option);
      } else {
        return [...current, option];
      }
    });
  };
  
  return (
    <SocialMediaAnalyticsContent
      showDataOptions={showDataOptions}
      selectedDataOptions={selectedDataOptions}
      showDataDropdownOpen={showDataDropdownOpen}
      setShowDataDropdownOpen={setShowDataDropdownOpen}
      toggleDataOption={toggleDataOption}
      isResetActive={isResetActive}
      isAnalyzing={isAnalyzing}
      isAnalyzeDisabled={isAnalyzeDisabled}
      handleReset={handleReset}
      handleAnalyze={handleAnalyze}
    />
  );
};

export default SocialMediaAnalytics;
