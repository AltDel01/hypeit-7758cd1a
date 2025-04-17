
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  width: number;
  height: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  dataArray,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestAnimationRef = useRef<number>(0);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !dataArray) {
      console.log("Missing required elements for visualization");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, width, height);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Draw outer rings with new colors
    for (let i = 0; i < 3; i++) {
      const radius = Math.min(width, height) * (0.35 + i * 0.15);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, `rgba(140, 82, 255, ${0.15 + i * 0.05})`); // Purple
      gradient.addColorStop(0.5, `rgba(30, 174, 219, ${0.12 + i * 0.04})`); // Blue
      gradient.addColorStop(1, 'rgba(30, 174, 219, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw inner circle with gradient from purple to blue
    const centerRadius = Math.min(width, height) * 0.25;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius
    );
    innerGradient.addColorStop(0, 'rgba(140, 82, 255, 0.9)'); // Purple core
    innerGradient.addColorStop(0.4, 'rgba(30, 174, 219, 0.7)'); // Blue middle
    innerGradient.addColorStop(0.8, 'rgba(30, 174, 219, 0.5)'); // Blue outer
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Draw frequency bars evenly around the entire circle
    const bufferLength = dataArray.length;
    const maxBarHeight = Math.min(width, height) * 0.35;
    const minBarHeight = Math.min(width, height) * 0.15;
    
    // Draw bars in a complete 360-degree pattern
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * value;
      
      // Calculate angle for even 360-degree distribution
      const angle = (i / bufferLength) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle) * centerRadius;
      const y1 = centerY + Math.sin(angle) * centerRadius;
      const x2 = centerX + Math.cos(angle) * (centerRadius + barHeight * value);
      const y2 = centerY + Math.sin(angle) * (centerRadius + barHeight * value);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 3 + value * 3;
      
      const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const position = (Math.abs(angle) % (Math.PI * 2)) / (Math.PI * 2);
      
      if (position < 0.33) {
        // Replace any white with soft red gradient
        lineGradient.addColorStop(0, 'rgba(254, 207, 205, 0.9)'); // Soft red start
        lineGradient.addColorStop(1, 'rgba(140, 82, 255, 0.9)');
      } else if (position < 0.66) {
        lineGradient.addColorStop(0, 'rgba(140, 82, 255, 0.9)');
        lineGradient.addColorStop(1, 'rgba(30, 174, 219, 0.9)');
      } else {
        lineGradient.addColorStop(0, 'rgba(30, 174, 219, 0.9)');
        // Replace white with soft red gradient
        lineGradient.addColorStop(1, 'rgba(254, 207, 205, 0.9)'); // Soft red end
      }
      
      ctx.strokeStyle = lineGradient;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      if (value > 0.4) {
        ctx.shadowColor = position < 0.33 ? '#FFDEE2' : // Soft red shadow instead of white
                         position < 0.66 ? '#8c52ff' : '#1EAEDB';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    
    // Animate pulse effect with bigger radius
    const time = Date.now() / 1000;
    const pulseRadius = Math.min(width, height) * (0.25 + 0.07 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    
    const pulseGradient = ctx.createLinearGradient(
      centerX - pulseRadius, centerY, 
      centerX + pulseRadius, centerY
    );
    // Replace white with soft red
    pulseGradient.addColorStop(0, 'rgba(254, 207, 205, 0.7)'); // Soft red
    pulseGradient.addColorStop(0.5, 'rgba(140, 82, 255, 0.7)');
    pulseGradient.addColorStop(1, 'rgba(30, 174, 219, 0.7)');
    
    ctx.strokeStyle = pulseGradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    requestAnimationRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    console.log("AudioVisualizer - Setting up animation frame");
    if (analyser && dataArray) {
      console.log("Starting visualizer animation with dimensions:", width, height);
      drawVisualizer();
    }
    
    return () => {
      console.log("Cleaning up animation frame");
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [analyser, dataArray, width, height]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 20,
        borderRadius: '50%'
      }}
    />
  );
};

export default AudioVisualizer;
