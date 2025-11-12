
import React, { useRef, useEffect } from 'react';
import { createCircleGradients, createInnerGradient, createWaveGradient, createPulseGradient } from './utils/gradientUtils';
import { calculateWavePoints, drawWave } from './utils/waveUtils';

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
    
    // Draw background circles with gradients
    const circleGradients = createCircleGradients(ctx, centerX, centerY, width, height);
    circleGradients.forEach(({ radius, gradient }) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
    
    // Draw center circle
    const centerRadius = Math.min(width, height) * 0.25;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    const innerGradient = createInnerGradient(ctx, centerX, centerY, centerRadius);
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Get frequency data and draw wave
    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
    
    const totalPoints = 128;
    const maxBarHeight = Math.min(width, height) * 0.35;
    const minBarHeight = Math.min(width, height) * 0.15;
    const baseRadius = centerRadius;
    
    const wavePoints = calculateWavePoints(
      dataArray,
      totalPoints,
      centerX,
      centerY,
      baseRadius,
      maxBarHeight,
      minBarHeight
    );
    
    const waveGradient = createWaveGradient(ctx, centerX, centerRadius);
    drawWave(ctx, wavePoints, waveGradient);
    
    // Draw pulse circle
    const time = Date.now() / 1000;
    const pulseRadius = Math.min(width, height) * (0.25 + 0.07 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    
    const pulseGradient = createPulseGradient(ctx, centerX, centerY, pulseRadius);
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
