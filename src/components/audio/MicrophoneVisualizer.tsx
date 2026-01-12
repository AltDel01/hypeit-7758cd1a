
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
  const [layout, setLayout] = useState({ size: 220, left: 0, top: 0 });
  const { isListening, analyser, dataArray } = useAudioVisualization(isActive, onClose);

  useEffect(() => {
    if (!containerRef.current) return;

    let raf = 0;

    const updateLayout = () => {
      const el = containerRef.current;
      if (!el) return;

      const baseSize = el.offsetWidth || 112;
      const size = Math.min(baseSize * 2.2, 220);

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const min = 8;
      const maxLeft = Math.max(min, window.innerWidth - size - min);
      const maxTop = Math.max(min, window.innerHeight - size - min);

      const left = Math.min(Math.max(min, centerX - size / 2), maxLeft);
      const top = Math.min(Math.max(min, centerY - size / 2), maxTop);

      setLayout({ size, left, top });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateLayout);
    };

    // Run once immediately (and when toggling active) to keep it glued to the button.
    scheduleUpdate();

    window.addEventListener("resize", scheduleUpdate);
    // Capture scroll events from nested scroll containers too.
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [containerRef, isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="fixed z-50"
      onClick={onClose}
      style={{ 
        width: `${layout.size}px`, 
        height: `${layout.size}px`,
        left: `${layout.left}px`,
        top: `${layout.top}px`,
        pointerEvents: 'all'
      }}
    >
      {analyser && dataArray && (
        <AudioVisualizer
          analyser={analyser}
          dataArray={dataArray}
          width={layout.size}
          height={layout.size}
        />
      )}
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
        <Mic 
          className="w-10 h-10 text-white animate-pulse" 
          strokeWidth={3}
          style={{ 
            filter: "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.9))",
            stroke: "white",
            strokeWidth: 3
          }} 
        />
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
