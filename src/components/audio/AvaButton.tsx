
import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrophoneVisualizer from './MicrophoneVisualizer';

const AvaButton: React.FC = () => {
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);

  const toggleVisualizer = () => {
    setIsVisualizerActive(prev => !prev);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main button */}
      <Button
        onClick={toggleVisualizer}
        className={`relative rounded-full w-14 h-14 p-0 flex items-center justify-center bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] animate-glow-pulse shadow-lg z-10 ${isVisualizerActive ? 'opacity-0' : 'opacity-100'}`}
        size="icon"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex items-center justify-center">
            <Mic className="h-5 w-5 text-white" />
          </div>
        </div>
      </Button>

      {/* Animated rings - only visible when not active */}
      {!isVisualizerActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/40 via-[#8c52ff]/30 to-[#1EAEDB]/20 animate-outer-pulse"></div>
          <div className="absolute inset-0 rounded-full animate-wave-circle"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/20 via-[#8c52ff]/10 to-[#1EAEDB]/5 animate-pulse-ring" style={{animationDelay: "0.3s"}}></div>
        </>
      )}

      {/* Visualizer in the same position as the button */}
      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={() => setIsVisualizerActive(false)} 
      />
    </div>
  );
};

export default AvaButton;
