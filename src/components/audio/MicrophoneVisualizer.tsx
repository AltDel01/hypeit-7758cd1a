
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
        const size = Math.max(containerRef.current.offsetWidth * 4, 320);
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
        right: '2rem',
        bottom: '2rem',
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
      
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-10 text-center w-full">
        <h3 className="text-3xl font-bold text-white animate-gradient-text shadow-glow">Listening...</h3>
        <p className="text-purple-200 mt-2 text-lg">
          Ask Ava about Social Media Marketing. Tap anywhere to cancel.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
