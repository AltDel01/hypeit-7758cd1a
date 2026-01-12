import React from 'react';
import Navbar from '@/components/layout/Navbar';
import PricingSection from '@/components/home/Pricing';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-8">
        <PricingSection />
      </div>
    </div>
  );
};

export default Pricing;
