import React from 'react';
import Seo from '@/components/seo/Seo';
import Navbar from '@/components/layout/Navbar';
import PricingSection from '@/components/home/Pricing';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Seo
        title="Pricing, Viralin Plans and Credits"
        description="Simple credit-based pricing. Pick Free, Starter, Pro, or Specialist and generate viral videos and images on your terms."
        path="/pricing"
      />
      <Navbar />
      <div className="pt-2">
        <PricingSection />
      </div>
    </div>
  );
};

export default Pricing;
