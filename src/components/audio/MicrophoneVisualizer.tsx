
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

  // Increase the size multiplier for the visualizer
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // Increase the multiplier from 3 to 4 for a bigger visualizer
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

  // Debug logging
  useEffect(() => {
    console.log("MicrophoneVisualizer rendered - isActive:", isActive, "isListening:", isListening);
    console.log("Analyser available:", !!analyser, "DataArray available:", !!dataArray);
    console.log("Dimensions:", dimensions);
  }, [isActive, isListening, analyser, dataArray, dimensions]);

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="absolute z-50 transform -translate-x-1/2 -translate-y-1/2"
      onClick={onClose}
      style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px`,
        left: '50%',
        bottom: '-50%'
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-full" />
      
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
