
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
    if (!canvas || !analyser || !dataArray) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Draw outer rings
    for (let i = 0; i < 3; i++) {
      const radius = Math.min(width, height) * (0.3 + i * 0.15);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, `rgba(254, 247, 205, ${0.1 + i * 0.05})`);
      gradient.addColorStop(0.5, `rgba(140, 82, 255, ${0.08 + i * 0.03})`);
      gradient.addColorStop(1, 'rgba(30, 174, 219, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw inner circle
    const centerRadius = Math.min(width, height) * 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius
    );
    innerGradient.addColorStop(0, 'rgba(254, 247, 205, 0.9)');
    innerGradient.addColorStop(0.4, 'rgba(140, 82, 255, 0.6)');
    innerGradient.addColorStop(0.8, 'rgba(30, 174, 219, 0.4)');
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Draw frequency bars
    const bufferLength = dataArray.length;
    const barWidth = (Math.PI * 2) / bufferLength;
    const maxBarHeight = Math.min(width, height) * 0.3;
    const minBarHeight = Math.min(width, height) * 0.12;
    
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * value;
      const angle = i * barWidth;
      
      const x1 = centerX + Math.cos(angle) * centerRadius;
      const y1 = centerY + Math.sin(angle) * centerRadius;
      const x2 = centerX + Math.cos(angle) * (centerRadius + barHeight * value);
      const y2 = centerY + Math.sin(angle) * (centerRadius + barHeight * value);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2 + value * 2;
      
      const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const position = (Math.abs(angle) % (Math.PI * 2)) / (Math.PI * 2);
      
      if (position < 0.33) {
        lineGradient.addColorStop(0, 'rgba(254, 247, 205, 0.8)');
        lineGradient.addColorStop(1, 'rgba(140, 82, 255, 0.9)');
      } else if (position < 0.66) {
        lineGradient.addColorStop(0, 'rgba(140, 82, 255, 0.9)');
        lineGradient.addColorStop(1, 'rgba(30, 174, 219, 0.8)');
      } else {
        lineGradient.addColorStop(0, 'rgba(30, 174, 219, 0.8)');
        lineGradient.addColorStop(1, 'rgba(254, 247, 205, 0.8)');
      }
      
      ctx.strokeStyle = lineGradient;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      if (value > 0.5) {
        ctx.shadowColor = position < 0.33 ? '#FEF7CD' : 
                         position < 0.66 ? '#8c52ff' : '#1EAEDB';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    
    // Animate pulse effect
    const time = Date.now() / 1000;
    const pulseRadius = Math.min(width, height) * (0.2 + 0.05 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    
    const pulseGradient = ctx.createLinearGradient(
      centerX - pulseRadius, centerY, 
      centerX + pulseRadius, centerY
    );
    pulseGradient.addColorStop(0, 'rgba(254, 247, 205, 0.6)');
    pulseGradient.addColorStop(0.5, 'rgba(140, 82, 255, 0.6)');
    pulseGradient.addColorStop(1, 'rgba(30, 174, 219, 0.6)');
    
    ctx.strokeStyle = pulseGradient;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    requestAnimationRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    if (analyser && dataArray) {
      drawVisualizer();
    }
    
    return () => {
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
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default AudioVisualizer;
