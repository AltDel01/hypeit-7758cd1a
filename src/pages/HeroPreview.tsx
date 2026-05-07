import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PokemonChooserHero from '@/components/home/PokemonChooserHero';

const HeroPreview = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <PokemonChooserHero />
      </main>
      <Footer />
    </div>
  );
};

export default HeroPreview;
