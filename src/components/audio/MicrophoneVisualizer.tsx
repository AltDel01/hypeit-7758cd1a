
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
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      // Create source from microphone input
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Set up data array for visualization
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Store references
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      
      setIsListening(true);
      drawVisualizer();
      
      // Show notification
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
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Update audio data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Draw outer glowing circles
    for (let i = 0; i < 3; i++) {
      const radius = Math.min(width, height) * (0.3 + i * 0.15);
      
      // Create radial gradient for circle with multi-color
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius
      );
      
      // Use yellow, purple, blue gradient
      gradient.addColorStop(0, `rgba(254, 247, 205, ${0.1 + i * 0.05})`);
      gradient.addColorStop(0.5, `rgba(140, 82, 255, ${0.08 + i * 0.03})`);
      gradient.addColorStop(1, 'rgba(30, 174, 219, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw the main visualizer
    const bufferLength = dataArrayRef.current.length;
    const barWidth = (Math.PI * 2) / bufferLength;
    
    // Main visualizer circle
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
    
    // Draw the sound bars
    const maxBarHeight = Math.min(width, height) * 0.3;
    const minBarHeight = Math.min(width, height) * 0.12;
    
    for (let i = 0; i < bufferLength; i++) {
      // Get audio data and normalize it
      const value = dataArrayRef.current[i] / 255;
      
      // Calculate bar height based on audio data
      const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * value;
      
      // Calculate angle for this bar
      const angle = i * barWidth;
      
      // Calculate positions
      const x1 = centerX + Math.cos(angle) * Math.min(width, height) * 0.2;
      const y1 = centerY + Math.sin(angle) * Math.min(width, height) * 0.2;
      const x2 = centerX + Math.cos(angle) * (Math.min(width, height) * 0.2 + barHeight * value);
      const y2 = centerY + Math.sin(angle) * (Math.min(width, height) * 0.2 + barHeight * value);
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2 + value * 2;
      
      // Create gradient for the lines with yellow-purple-blue
      const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      // Determine color based on angle position
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
      
      // Add glow to active bars
      if (value > 0.5) {
        ctx.shadowColor = position < 0.33 ? '#FEF7CD' : 
                          position < 0.66 ? '#8c52ff' : '#1EAEDB';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    
    // Draw pulse effect
    const time = Date.now() / 1000;
    const pulseRadius = Math.min(width, height) * (0.2 + 0.05 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    
    // Use gradient for pulse effect
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
    
    // Continue the animation loop
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
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="relative z-10 text-center">
        <div className="animate-pulse mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/30 flex items-center justify-center mx-auto">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white animate-gradient-text shadow-glow">Listening...</h3>
        <p className="text-purple-200 mt-2 max-w-xs mx-auto">
          Ask Ava about Social Media Marketing. Tap anywhere to cancel.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
