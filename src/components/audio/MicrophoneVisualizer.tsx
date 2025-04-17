
import React, { useEffect, useState } from 'react';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import AudioVisualizer from './AudioVisualizer';

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
        const size = Math.max(containerRef.current.offsetWidth * 3, 200);
        setDimensions({ width: size, height: size });
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
      className="absolute -inset-[100%] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-full" />
      
      <AudioVisualizer
        analyser={analyser}
        dataArray={dataArray}
        width={dimensions.width}
        height={dimensions.height}
      />
      
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-white animate-gradient-text shadow-glow">Listening...</h3>
        <p className="text-purple-200 mt-2 text-sm">
          Ask Ava about Social Media Marketing. Tap anywhere to cancel.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
