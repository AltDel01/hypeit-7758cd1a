
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import StableDiffusionInpainting from '@/components/StableDiffusionInpainting';

const StableDiffusionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <StableDiffusionInpainting />
      </div>
    </div>
  );
};

export default StableDiffusionPage;
