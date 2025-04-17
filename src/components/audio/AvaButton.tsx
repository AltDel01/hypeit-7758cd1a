
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
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleVisualizer}
          className="rounded-full w-14 h-14 p-0 flex items-center justify-center bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] animate-glow-pulse shadow-lg"
          size="icon"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8c52ff] via-[#9b87f5] to-[#1EAEDB] flex items-center justify-center animate-pulse">
            <Mic className="h-5 w-5 text-white" />
          </div>
        </Button>
      </div>

      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={() => setIsVisualizerActive(false)} 
      />
    </>
  );
};

export default AvaButton;
