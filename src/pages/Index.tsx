import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroWithEditor from '@/components/home/HeroWithEditor';
import CoreFeatures from '@/components/home/CoreFeatures';
import PlatformBenefits from '@/components/home/PlatformBenefits';
import HowItWorks from '@/components/home/HowItWorks';
import ShowcaseGallery from '@/components/home/ShowcaseGallery';
import FinalCTA from '@/components/home/FinalCTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <HeroWithEditor />
        <CoreFeatures />
        <PlatformBenefits />
        <HowItWorks />
        <ShowcaseGallery />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
