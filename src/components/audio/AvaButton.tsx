
import React, { useState, useRef } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrophoneVisualizer from './MicrophoneVisualizer';

const AvaButton: React.FC = () => {
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const toggleVisualizer = () => {
    setIsVisualizerActive(prev => !prev);
    console.log("Toggled visualizer to:", !isVisualizerActive);
  };

  return (
    <div ref={buttonRef} className="fixed bottom-6 right-6 z-50">
      {/* Only show button animations when not listening */}
      {!isVisualizerActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/40 via-[#8c52ff]/30 to-[#1EAEDB]/20 animate-outer-pulse"></div>
          <div className="absolute inset-0 rounded-full animate-wave-circle"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/20 via-[#8c52ff]/10 to-[#1EAEDB]/5 animate-pulse-ring" style={{animationDelay: "0.3s"}}></div>
        </>
      )}
      
      {/* Increase the button size when not listening */}
      {!isVisualizerActive && (
        <Button
          onClick={toggleVisualizer}
          className="rounded-full w-20 h-20 p-0 flex items-center justify-center bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] animate-glow-pulse shadow-lg relative z-10"
          size="icon"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex items-center justify-center">
              <Mic className="h-7 w-7 text-white" />
            </div>
          </div>
        </Button>
      )}

      {/* Always render the visualizer component, its visibility is controlled internally */}
      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={() => {
          console.log("Closing visualizer");
          setIsVisualizerActive(false);
        }}
        containerRef={buttonRef}
      />
    </div>
  );
};

export default AvaButton;
