
import React, { useState } from 'react';
import { showDataOptions } from './social-media-analytics/constants';
import SocialMediaAnalyticsContent from './social-media-analytics/SocialMediaAnalyticsContent';
import { useAnalyticsActions } from './social-media-analytics/useAnalyticsActions';

const SocialMediaAnalytics: React.FC = () => {
  const [selectedDataOptions, setSelectedDataOptions] = useState<string[]>(showDataOptions);
  const [showDataDropdownOpen, setShowDataDropdownOpen] = useState(false);
  
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
