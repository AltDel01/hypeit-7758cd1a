import React from 'react';

interface AuroraBackgroundProps {
  children: React.ReactNode;
}

// Plain background wrapper. The cursor-following color glow was removed because it caused dizziness.
const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-hidden bg-background">{children}</div>
);

export default AuroraBackground;
