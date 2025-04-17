
import React, { useRef, useEffect, useState } from 'react';
import { toast } from "sonner";

interface MicrophoneVisualizerProps {
  isActive: boolean;
  onClose: () => void;
}

const MicrophoneVisualizer: React.FC<MicrophoneVisualizerProps> = ({ 
  isActive, 
  onClose 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number>(0);
  const [isListening, setIsListening] = useState(false);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      
      setIsListening(true);
      drawVisualizer();
      toast.success("Microphone activated");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
      onClose();
    }
  };

  const stopMicrophone = () => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    streamRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!canvas || !analyser || !dataArray) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Update frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average frequencies for different bands
    const bassAvg = getAverageFrequency(dataArray, 0, 3);
    const midAvg = getAverageFrequency(dataArray, 4, 10);
    const trebleAvg = getAverageFrequency(dataArray, 11, 20);
    
    // Draw outer aura
    const time = Date.now() / 1000;
    const outerRadius = Math.min(width, height) * 0.4;
    
    // Create gradient for outer ring
    const gradient = ctx.createLinearGradient(
      centerX - outerRadius, 
      centerY - outerRadius,
      centerX + outerRadius, 
      centerY + outerRadius
    );
    gradient.addColorStop(0, `rgba(0, 255, 255, ${0.3 + bassAvg * 0.002})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 255, ${0.3 + midAvg * 0.002})`);
    gradient.addColorStop(1, `rgba(100, 200, 255, ${0.3 + trebleAvg * 0.002})`);
    
    // Draw outer ring with distortion
    ctx.beginPath();
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const distortionAmount = 0.2 + (bassAvg / 255) * 0.3;
      const radiusOffset = outerRadius * (1 + Math.sin(angle * 8 + time * 2) * distortionAmount);
      const x = centerX + Math.cos(angle) * radiusOffset;
      const y = centerY + Math.sin(angle) * radiusOffset;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4 + bassAvg * 0.1;
    ctx.filter = 'blur(8px)';
    ctx.stroke();
    ctx.filter = 'none';
    
    // Draw central ball
    const ballSize = 30 + (bassAvg * 0.3);
    const ballGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, ballSize
    );
    
    ballGradient.addColorStop(0, `rgba(150, 220, 255, ${0.8 + bassAvg * 0.001})`);
    ballGradient.addColorStop(0.5, `rgba(100, 180, 255, ${0.6 + midAvg * 0.001})`);
    ballGradient.addColorStop(1, 'rgba(50, 120, 255, 0)');
    
    // Draw morphing ball
    ctx.beginPath();
    const points = 12;
    const angleStep = (Math.PI * 2) / points;
    const distortion = 0.3 + (bassAvg / 255) * 0.4;
    
    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep;
      const radiusOffset = ballSize * (1 + Math.sin(angle * 3 + time * 4) * distortion);
      const x = centerX + Math.cos(angle) * radiusOffset;
      const y = centerY + Math.sin(angle) * radiusOffset;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = ballGradient;
    ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    requestAnimationRef.current = requestAnimationFrame(drawVisualizer);
  };

  const getAverageFrequency = (dataArray: Uint8Array, start: number, end: number): number => {
    let sum = 0;
    const count = Math.min(end, dataArray.length) - start;
    if (count <= 0) return 0;
    for (let i = start; i < Math.min(end, dataArray.length); i++) {
      sum += dataArray[i];
    }
    return sum / count;
  };

  useEffect(() => {
    if (isActive && !isListening) {
      startMicrophone();
    } else if (!isActive && isListening) {
      stopMicrophone();
    }
    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
      stopMicrophone();
    };
  }, [isActive]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <div className="absolute bottom-0 right-0 z-[1000] w-48 h-48">
      <div className="relative w-full h-full">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 rounded-full w-full h-full"
        />
        <div 
          className="absolute top-2 right-2 z-10 p-1 bg-black/30 rounded-full hover:bg-black/50 cursor-pointer"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6L18 18"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
