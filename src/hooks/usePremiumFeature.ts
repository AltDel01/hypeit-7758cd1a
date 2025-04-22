
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const usePremiumFeature = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  const { user } = useAuth();

  const checkPremiumFeature = (feature: string) => {
    // Always allow access for the specific email
    const isAdmin = user?.email === 'putra.ekadarma@gmail.com';
    
    if (isAdmin) {
      return true;
    }
    
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
