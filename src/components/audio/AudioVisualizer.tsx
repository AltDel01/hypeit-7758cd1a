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
    
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < 3; i++) {
      const radius = Math.min(width, height) * (0.35 + i * 0.15);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, `rgba(140, 82, 255, ${0.15 + i * 0.05})`);
      gradient.addColorStop(0.5, `rgba(30, 174, 219, ${0.12 + i * 0.04})`);
      gradient.addColorStop(1, 'rgba(30, 174, 219, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    const centerRadius = Math.min(width, height) * 0.25;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius
    );
    innerGradient.addColorStop(0, 'rgba(140, 82, 255, 0.9)');
    innerGradient.addColorStop(0.4, 'rgba(30, 174, 219, 0.7)');
    innerGradient.addColorStop(0.8, 'rgba(30, 174, 219, 0.5)');
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    analyser.getByteFrequencyData(dataArray);
    
    const totalPoints = 128;
    const frequencyStep = Math.floor(dataArray.length / totalPoints);
    
    const maxBarHeight = Math.min(width, height) * 0.35;
    const minBarHeight = Math.min(width, height) * 0.15;
    const baseRadius = centerRadius;
    
    const wavePoints = [];
    const time = Date.now() / 1000;
    
    for (let i = 0; i <= totalPoints; i++) {
      const dataIndex = (i % totalPoints) * frequencyStep;
      if (dataIndex >= dataArray.length) continue;
      
      const value = dataArray[dataIndex] / 255;
      
      const angle = (i / totalPoints) * Math.PI * 2;
      
      const waveOffset = Math.sin(angle * 3 + time * 1.5) * 0.1;
      
      const normalizedValue = Math.max(0.15, value * 0.8 + waveOffset);
      const waveHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedValue;
      
      const x = centerX + Math.cos(angle) * (baseRadius + waveHeight);
      const y = centerY + Math.sin(angle) * (baseRadius + waveHeight);
      
      wavePoints.push({ x, y });
    }
    
    if (wavePoints.length > 0 && wavePoints[0].x !== wavePoints[wavePoints.length - 1].x) {
      wavePoints.push(wavePoints[0]);
    }
    
    const waveLineWidth = 15;
    ctx.beginPath();
    
    if (wavePoints.length > 0) {
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      }
    }
    
    const waveGradient = ctx.createLinearGradient(
      centerX - centerRadius * 2, 
      centerY - centerRadius * 2,
      centerX + centerRadius * 2, 
      centerY + centerRadius * 2
    );
    
    waveGradient.addColorStop(0, 'rgba(254, 207, 205, 0.9)');
    waveGradient.addColorStop(0.33, 'rgba(140, 82, 255, 0.9)');
    waveGradient.addColorStop(0.66, 'rgba(30, 174, 219, 0.9)');
    waveGradient.addColorStop(1, 'rgba(254, 207, 205, 0.9)');
    
    ctx.lineWidth = waveLineWidth;
    ctx.strokeStyle = waveGradient;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.shadowColor = 'rgba(254, 207, 205, 0.7)';
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const pulseRadius = Math.min(width, height) * (0.25 + 0.07 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    
    const pulseGradient = ctx.createLinearGradient(
      centerX - pulseRadius, centerY, 
      centerX + pulseRadius, centerY
    );
    pulseGradient.addColorStop(0, 'rgba(254, 207, 205, 0.7)');
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
