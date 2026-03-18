import React, { useEffect, useState } from 'react';

interface IntroSceneProps {
  active: boolean;
}

const IntroScene: React.FC<IntroSceneProps> = ({ active }) => {
  const [showTitle, setShowTitle] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (active) {
      setShowGlow(true);
      const t1 = setTimeout(() => setShowTitle(true), 300);
      const t2 = setTimeout(() => setShowTagline(true), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowTitle(false);
      setShowTagline(false);
      setShowGlow(false);
    }
  }, [active]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Glow orbs */}
      <div className={`absolute w-[500px] h-[500px] rounded-full transition-all duration-1000 ${showGlow ? 'opacity-60 scale-100' : 'opacity-0 scale-50'}`}
        style={{
          background: 'radial-gradient(circle, hsla(262, 100%, 66%, 0.5) 0%, hsla(210, 100%, 50%, 0.2) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div className={`absolute w-[300px] h-[300px] rounded-full transition-all duration-1500 delay-300 ${showGlow ? 'opacity-40 scale-100' : 'opacity-0 scale-50'}`}
        style={{
          background: 'radial-gradient(circle, hsla(290, 80%, 50%, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '30%',
          right: '25%',
        }}
      />

      {/* Title */}
      <h1 className={`relative z-10 text-6xl md:text-8xl font-black tracking-tighter transition-all duration-700 ${showTitle ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'}`}>
        <span className="animate-gradient-text">Viralin AI</span>
      </h1>

      {/* Tagline */}
      <p className={`relative z-10 mt-6 text-xl md:text-2xl font-light tracking-wide text-muted-foreground transition-all duration-700 delay-200 ${showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        Chat-Based AI Video Editing
      </p>

      {/* Decorative dots */}
      <div className={`relative z-10 flex gap-2 mt-10 transition-all duration-500 delay-500 ${showTagline ? 'opacity-100' : 'opacity-0'}`}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  );
};

export default IntroScene;
