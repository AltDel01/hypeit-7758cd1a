
import React, { useEffect, useRef } from 'react';

interface AuroraBackgroundProps {
  children: React.ReactNode;
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const aurora = auroraRef.current;
    
    if (!container || !aurora) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Calculate movement based on cursor position
      const moveX = (x - 0.5) * 30;
      const moveY = (y - 0.5) * 30;
      
      // Apply transformation to the aurora effect
      aurora.style.transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Adjust the gradient position for a dynamic effect
      aurora.style.background = `
        radial-gradient(
          circle at ${x * 100}% ${y * 100}%,
          rgba(155, 135, 245, 0.8) 0%,
          rgba(126, 105, 171, 0.6) 25%,
          rgba(110, 89, 165, 0.4) 50%,
          rgba(14, 165, 233, 0.3) 75%,
          rgba(0, 0, 0, 0) 100%
        )
      `;
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden">
      <div 
        ref={auroraRef} 
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(155, 135, 245, 0.8) 0%, rgba(126, 105, 171, 0.6) 25%, rgba(110, 89, 165, 0.4) 50%, rgba(14, 165, 233, 0.3) 75%, rgba(0, 0, 0, 0) 100%)',
          filter: 'blur(80px)',
          opacity: 0.7,
          zIndex: 0
        }}
      />
      {children}
    </div>
  );
};

export default AuroraBackground;
