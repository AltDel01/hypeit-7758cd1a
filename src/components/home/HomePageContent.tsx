
import React from 'react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Navbar from '@/components/layout/Navbar';
import ContentSection from '@/components/home/ContentSection';
import ImageGallerySection from '@/components/home/ImageGallerySection';
import AvaButton from '@/components/audio/AvaButton';

const HomePageContent: React.FC = () => {
  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
          <ContentSection />
          <ImageGallerySection />
        </main>
        
        <AvaButton />
      </div>
    </AuroraBackground>
  );
};

export default HomePageContent;
