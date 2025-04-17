
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
    
    // Draw frequency wave around the circle
    analyser.getByteFrequencyData(dataArray);
    const totalPoints = 120; // Number of points around the circle
    const step = Math.floor(dataArray.length / totalPoints);
    const maxBarHeight = Math.min(width, height) * 0.35;
    const minBarHeight = Math.min(width, height) * 0.15;
    
    // First collect all wave points
    const wavePoints = [];
    
    for (let i = 0; i < totalPoints; i++) {
      const dataIndex = (i * step) % dataArray.length;
      const value = dataArray[dataIndex] / 255;
      
      // Calculate angle for even 360-degree distribution
      const angle = (i / totalPoints) * Math.PI * 2;
      
      // Add wave effect using sine wave with time
      const time = Date.now() / 1000;
      const waveOffset = Math.sin(angle * 4 + time * 2) * 0.15; 
      
      // Ensure minimum wave height even with no sound
      const amplifiedValue = Math.max(0.1, value);
      const waveHeight = minBarHeight + (maxBarHeight - minBarHeight) * (amplifiedValue + waveOffset);
      
      const x = centerX + Math.cos(angle) * (centerRadius + waveHeight * amplifiedValue);
      const y = centerY + Math.sin(angle) * (centerRadius + waveHeight * amplifiedValue);
      
      wavePoints.push({ x, y });
    }
    
    // Draw the continuous wave with complete loop
    ctx.beginPath();
    
    // Start from the last point to ensure continuity
    if (wavePoints.length > 0) {
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      // Draw lines to all points
      for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      }
      
      // Close the path by returning to the first point
      ctx.lineTo(wavePoints[0].x, wavePoints[0].y);
    }
    
    // Create gradient for the wave
    const waveGradient = ctx.createLinearGradient(
      centerX - centerRadius * 1.5, 
      centerY - centerRadius * 1.5,
      centerX + centerRadius * 1.5, 
      centerY + centerRadius * 1.5
    );
    
    // Use soft red gradient with other colors
    waveGradient.addColorStop(0, 'rgba(254, 207, 205, 0.8)'); // Soft red
    waveGradient.addColorStop(0.33, 'rgba(140, 82, 255, 0.8)'); // Purple
    waveGradient.addColorStop(0.66, 'rgba(30, 174, 219, 0.8)'); // Blue
    waveGradient.addColorStop(1, 'rgba(254, 207, 205, 0.8)'); // Back to soft red
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = waveGradient;
    ctx.stroke();
    
    // Add glow effect to the wave
    ctx.shadowColor = 'rgba(254, 207, 205, 0.5)'; // Soft red glow
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
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
