import React, { useRef, useEffect, useState } from 'react';
import { toast } from "sonner";

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
      analyser.fftSize = 512;

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
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    sourceRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current || !dataArrayRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
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
    
    const bufferLength = dataArrayRef.current.length;
    const barWidth = (Math.PI * 2) / bufferLength;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(width, height) * 0.2, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.min(width, height) * 0.2
    );
    innerGradient.addColorStop(0, 'rgba(254, 247, 205, 0.9)');
    innerGradient.addColorStop(0.4, 'rgba(140, 82, 255, 0.6)');
    innerGradient.addColorStop(0.8, 'rgba(30, 174, 219, 0.4)');
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    const maxBarHeight = Math.min(width, height) * 0.3;
    const minBarHeight = Math.min(width, height) * 0.12;
    
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArrayRef.current[i] / 255;
      
      const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * value;
      
      const angle = i * barWidth;
      
      const x1 = centerX + Math.cos(angle) * Math.min(width, height) * 0.2;
      const y1 = centerY + Math.sin(angle) * Math.min(width, height) * 0.2;
      const x2 = centerX + Math.cos(angle) * (Math.min(width, height) * 0.2 + barHeight * value);
      const y2 = centerY + Math.sin(angle) * (Math.min(width, height) * 0.2 + barHeight * value);
      
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
    if (canvasRef.current && containerRef.current) {
      const size = Math.max(containerRef.current.offsetWidth * 3, 200);
      canvasRef.current.width = size;
      canvasRef.current.height = size;
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
      if (canvasRef.current && containerRef.current) {
        const size = Math.max(containerRef.current.offsetWidth * 3, 200);
        canvasRef.current.width = size;
        canvasRef.current.height = size;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="absolute -inset-[100%] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-full" />
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-white animate-gradient-text shadow-glow">Listening...</h3>
        <p className="text-purple-200 mt-2 text-sm">
          Ask Ava about Social Media Marketing. Tap anywhere to cancel.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
