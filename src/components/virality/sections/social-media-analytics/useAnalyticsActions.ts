import { useState } from 'react';

export const useAnalyticsActions = () => {
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

  return {
    isAnalyzing,
    isResetActive,
    isAnalyzeDisabled,
    handleReset,
    handleAnalyze
  };
};
