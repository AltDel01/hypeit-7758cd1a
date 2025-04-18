
import { useState } from 'react';

export const usePremiumFeature = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');

  const checkPremiumFeature = (feature: string) => {
    // This will be replaced with actual subscription check when Stripe is integrated
    const isSubscribed = false;
    
    if (!isSubscribed) {
      setSelectedFeature(feature);
      setShowPremiumModal(true);
      return false;
    }
    
    return true;
  };

  return {
    showPremiumModal,
    selectedFeature,
    checkPremiumFeature,
    closePremiumModal: () => setShowPremiumModal(false),
  };
};
