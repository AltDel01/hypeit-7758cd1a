import React, { useState, useEffect, useRef } from 'react';
import heroAstronaut from '@/assets/enterprise/hero-astronaut.jpg';
import heroTravel from '@/assets/enterprise/hero-travel.jpg';
import heroCpg from '@/assets/enterprise/hero-cpg.jpg';
import heroAgency from '@/assets/enterprise/hero-agency.jpg';

const images = [heroAstronaut, heroTravel, heroCpg, heroAgency];

const HeroBackground: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>([]);
  const firstLoaded = loaded[0] ?? false;

  useEffect(() => {
    // Preload all images
    const loadStates = new Array(images.length).fill(false);
    images.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadStates[i] = true;
        setLoaded([...loadStates]);
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: currentIndex === i && firstLoaded ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
            className="w-full h-full object-cover scale-105"
            style={{
              animation: currentIndex === i ? 'heroZoom 6s ease-in-out forwards' : 'none',
            }}
          />
        </div>
      ))}
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
    </div>
  );
};

export default HeroBackground;
