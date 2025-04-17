
import React, { useRef, useEffect } from 'react';
import { toast } from "sonner";

interface MicrophoneVisualizerProps {
  isActive: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

const MicrophoneVisualizer: React.FC<MicrophoneVisualizerProps> = ({ 
  isActive, 
  onClose,
  buttonRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      
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
    
    streamRef.current = null;
    audioContextRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current || !dataArrayRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.01;
    
    // Update audio data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
    
    // Clear the canvas with a fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.25;
    
    // Draw outer ring (thicker)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(140, 82, 255, ${0.5 + average / 512})`;
    ctx.lineWidth = 30; // Increased thickness
    ctx.stroke();
    
    // Draw middle ring with gradient
    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius * 1.2,
      centerX, centerY, radius * 1.6
    );
    gradient.addColorStop(0, `rgba(30, 174, 219, ${0.3 + average / 512})`);
    gradient.addColorStop(1, `rgba(254, 247, 205, ${0.2 + average / 512})`);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
    ctx.lineWidth = 40; // Thicker middle ring
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Draw morphing center circle
    ctx.beginPath();
    const morphRadius = radius * (0.8 + Math.sin(timeRef.current * 3) * 0.1);
    const points = 12;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const distortion = Math.sin(timeRef.current * 5 + i) * (average / 512) * 20;
      const x = centerX + (morphRadius + distortion) * Math.cos(angle);
      const y = centerY + (morphRadius + distortion) * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    const centerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, morphRadius
    );
    centerGradient.addColorStop(0, `rgba(30, 219, 143, ${0.8 + average / 512})`);
    centerGradient.addColorStop(1, `rgba(30, 219, 143, ${0.4 + average / 512})`);
    
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    requestAnimationRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    if (isActive) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
    
    return () => {
      stopMicrophone();
    };
  }, [isActive]);

  useEffect(() => {
    if (!buttonRef.current || !canvasRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 4;
    
    canvasRef.current.width = size;
    canvasRef.current.height = size;
    
    const left = rect.left + rect.width / 2 - size / 2;
    const top = rect.top + rect.height / 2 - size / 2;
    
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${left}px, ${top}px)`;
    }
  }, [buttonRef]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-auto" onClick={onClose}>
      <canvas 
        ref={canvasRef}
        className="absolute"
        style={{
          transition: 'transform 0.3s ease-out'
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
        <h3 className="text-2xl font-bold animate-gradient-text shadow-glow mb-2">Listening...</h3>
        <p className="text-sm text-purple-200">
          Ask Ava about Social Media Marketing. Tap anywhere to cancel.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneVisualizer;
