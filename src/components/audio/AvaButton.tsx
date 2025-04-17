
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
      <Button
        onClick={toggleVisualizer}
        className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white flex items-center gap-2 px-4 py-2 rounded-full"
      >
        <Mic className="h-4 w-4" />
        <span>Activate Ava</span>
      </Button>

      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={() => setIsVisualizerActive(false)} 
      />
    </>
  );
};

export default AvaButton;
