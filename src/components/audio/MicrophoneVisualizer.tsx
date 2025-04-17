
import React, { useEffect, useState } from 'react';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import AudioVisualizer from './AudioVisualizer';
import { Mic } from 'lucide-react';

interface MicrophoneVisualizerProps {
  isActive: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const MicrophoneVisualizer: React.FC<MicrophoneVisualizerProps> = ({ 
  isActive, 
  onClose,
  containerRef
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { isListening, analyser, dataArray } = useAudioVisualization(isActive, onClose);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const size = Math.min(containerRef.current.offsetWidth * 1.8, 180); // Reduced size more
        setDimensions({ width: size, height: size });
        console.log("Updated visualizer dimensions to:", size);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef]);

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="fixed z-50"
      onClick={onClose}
      style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px`,
        right: '50%',
        bottom: '10rem',
        transform: 'translateX(50%)', // Center it horizontally like the button
        pointerEvents: 'all'
      }}
    >      
      {analyser && dataArray && (
        <AudioVisualizer
          analyser={analyser}
          dataArray={dataArray}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <Mic 
          className="w-8 h-8 text-white animate-pulse" 
          strokeWidth={3}
          style={{ filter: "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.7))" }} // Add glow effect to make it more visible
        />
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
