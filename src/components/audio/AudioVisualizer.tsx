
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
    
    // Draw frequency wave around the circle - with improved distribution
    analyser.getByteFrequencyData(dataArray);
    
    // Fixed number of points for 360-degree coverage
    const totalPoints = 128;
    
    // Sample frequency data evenly across the available spectrum
    const frequencyStep = Math.floor(dataArray.length / totalPoints);
    
    // Calculate wave parameters
    const maxBarHeight = Math.min(width, height) * 0.35;
    const minBarHeight = Math.min(width, height) * 0.15;
    const baseRadius = centerRadius;
    
    // Store all points for continuous wave
    const wavePoints = [];
    const time = Date.now() / 1000; // For animation effect
    
    // Generate points all the way around the circle
    for (let i = 0; i <= totalPoints; i++) {
      // Use modulo to ensure we don't exceed dataArray bounds
      const dataIndex = (i % totalPoints) * frequencyStep;
      if (dataIndex >= dataArray.length) continue;
      
      // Get normalized frequency value (0-1)
      const value = dataArray[dataIndex] / 255;
      
      // Calculate precise angle for this point (fully circular)
      const angle = (i / totalPoints) * Math.PI * 2;
      
      // Add wave effect with time component
      const waveOffset = Math.sin(angle * 3 + time * 1.5) * 0.1;
      
      // Calculate wave height with minimum value to ensure visibility
      const normalizedValue = Math.max(0.15, value * 0.8 + waveOffset);
      const waveHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedValue;
      
      // Calculate point position on circular path
      const x = centerX + Math.cos(angle) * (baseRadius + waveHeight);
      const y = centerY + Math.sin(angle) * (baseRadius + waveHeight);
      
      // Add to wave points array
      wavePoints.push({ x, y });
    }
    
    // Ensure the wave closes properly by duplicating the first point if needed
    if (wavePoints.length > 0 && wavePoints[0].x !== wavePoints[wavePoints.length - 1].x) {
      wavePoints.push(wavePoints[0]);
    }
    
    // Draw the continuous wave
    ctx.beginPath();
    
    if (wavePoints.length > 0) {
      // Start from the first point
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      // Draw smooth curve through all points
      for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      }
    }
    
    // Create gradient for the wave with broader color spread
    const waveGradient = ctx.createLinearGradient(
      centerX - centerRadius * 1.8, 
      centerY - centerRadius * 1.8,
      centerX + centerRadius * 1.8, 
      centerY + centerRadius * 1.8
    );
    
    // Use soft red gradient with other colors
    waveGradient.addColorStop(0, 'rgba(254, 207, 205, 0.85)'); // Soft red
    waveGradient.addColorStop(0.33, 'rgba(140, 82, 255, 0.85)'); // Purple
    waveGradient.addColorStop(0.66, 'rgba(30, 174, 219, 0.85)'); // Blue
    waveGradient.addColorStop(1, 'rgba(254, 207, 205, 0.85)'); // Back to soft red
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = waveGradient;
    ctx.stroke();
    
    // Add glow effect to the wave
    ctx.shadowColor = 'rgba(254, 207, 205, 0.6)'; // Enhanced soft red glow
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Animate pulse effect with bigger radius
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
