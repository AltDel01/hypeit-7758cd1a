import { useState } from 'react';
import { useAdminRole } from '@/hooks/useAdminRole';

export const usePremiumFeature = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  const { isAdmin } = useAdminRole();

  const checkPremiumFeature = (feature: string) => {
    // Use server-side verified admin role check
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
