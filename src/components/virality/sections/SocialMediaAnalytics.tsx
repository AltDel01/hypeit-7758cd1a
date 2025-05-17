import React, { useState } from 'react';
import { showDataOptions } from './social-media-analytics/constants';
import SocialMediaAnalyticsContent from './social-media-analytics/SocialMediaAnalyticsContent';

const SocialMediaAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isAnalyzeDisabled, setIsAnalyzeDisabled] = useState(false);
  const [selectedDataOptions, setSelectedDataOptions] = useState<string[]>(showDataOptions);
  const [showDataDropdownOpen, setShowDataDropdownOpen] = useState(false);
  
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
