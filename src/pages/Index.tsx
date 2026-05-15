import React from 'react';
import Seo from '@/components/seo/Seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatComposer from '@/components/home/ChatComposer';
import CoreFeatures from '@/components/home/CoreFeatures';
import PlatformBenefits from '@/components/home/PlatformBenefits';
import HowItWorks from '@/components/home/HowItWorks';
import ShowcaseGallery from '@/components/home/ShowcaseGallery';
import FinalCTA from '@/components/home/FinalCTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Seo
        title="Viralin, Generate Viral Content in Minutes"
        description="Brainstorm and generate viral videos, images, and brand content in one multimodal AI prompt. Built for creators."
        path="/"
      />
      <Navbar />
      <main>
        <ChatComposer />
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
