
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

  // Grid texture for overlay
  const gridTextureRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Create grid texture once
    const createGridTexture = () => {
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = 100;
      gridCanvas.height = 100;
      const gridCtx = gridCanvas.getContext('2d');
      
      if (gridCtx) {
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        gridCtx.lineWidth = 0.5;
        
        // Draw horizontal lines
        for (let i = 0; i <= 100; i += 10) {
          gridCtx.beginPath();
          gridCtx.moveTo(0, i);
          gridCtx.lineTo(100, i);
          gridCtx.stroke();
        }
        
        // Draw vertical lines
        for (let i = 0; i <= 100; i += 10) {
          gridCtx.beginPath();
          gridCtx.moveTo(i, 0);
          gridCtx.lineTo(i, 100);
          gridCtx.stroke();
        }
      }
      
      gridTextureRef.current = gridCanvas;
    };
    
    createGridTexture();
  }, []);

  const startMicrophone = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Smaller for better performance but still detailed
      analyser.smoothingTimeConstant = 0.8; // Smoother transitions

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
    const radius = Math.min(width, height) / 2 - 10;
    
    // Clear the canvas with slight fade effect for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Update audio data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const dataArray = dataArrayRef.current;
    
    // Extract frequency bands for different visualizations
    const bassAvg = getAverageFrequency(dataArray, 0, 5); // Low frequencies
    const midAvg = getAverageFrequency(dataArray, 6, 20); // Mid frequencies
    const trebleAvg = getAverageFrequency(dataArray, 21, 50); // High frequencies
    
    // Apply grid texture
    if (gridTextureRef.current) {
      const time = Date.now() / 10000;
      ctx.save();
      ctx.globalAlpha = 0.05 + bassAvg * 0.002;
      ctx.translate(centerX, centerY);
      ctx.rotate(time);
      ctx.scale(1 + bassAvg * 0.01, 1 + bassAvg * 0.01);
      
      // Create a pattern using the grid texture
      const pattern = ctx.createPattern(gridTextureRef.current, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(-width, -height, width * 2, height * 2);
      }
      ctx.restore();
    }
    
    // Draw center sphere that morphs with bass
    const centerSize = 30 + bassAvg * 0.4;
    const sphereGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerSize
    );
    
    // Purple-blue center based on bass intensity
    sphereGradient.addColorStop(0, `rgba(180, 120, 255, ${0.6 + bassAvg * 0.002})`);
    sphereGradient.addColorStop(0.6, `rgba(120, 80, 255, ${0.5 + bassAvg * 0.001})`);
    sphereGradient.addColorStop(1, 'rgba(70, 40, 220, 0)');
    
    ctx.beginPath();
    
    // Apply slight distortion based on bass
    if (bassAvg > 100) {
      // Morph into polygon when bass is strong
      const points = 6 + Math.floor(bassAvg / 30);
      const angleStep = (Math.PI * 2) / points;
      const distortion = 0.8 + (bassAvg / 200);
      
      for (let i = 0; i < points; i++) {
        const angle = i * angleStep;
        const x = centerX + Math.cos(angle) * centerSize * (1 + Math.sin(angle * 3) * 0.1 * distortion);
        const y = centerY + Math.sin(angle) * centerSize * (1 + Math.cos(angle * 3) * 0.1 * distortion);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
    } else {
      // Regular circle for lower bass
      ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2);
    }
    
    ctx.fillStyle = sphereGradient;
    ctx.fill();
    
    // Add glow effect based on audio intensity
    const glowSize = 5 + bassAvg * 0.2;
    ctx.shadowColor = `rgba(140, 80, 255, ${bassAvg / 255})`;
    ctx.shadowBlur = glowSize;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Add subtle lens flare on center sphere
    addLensFlare(ctx, centerX, centerY, bassAvg);
    
    // Draw orbital rings responding to mid frequencies
    const rings = 4;
    const maxRingRadius = radius * 0.9;
    
    for (let r = 0; r < rings; r++) {
      const ringRadius = (r + 1) * (maxRingRadius / rings);
      const ringWidth = 2 + midAvg * 0.05;
      
      // Calculate ring distortion based on audio
      const distortionAmount = 0.2 + (midAvg / 255) * 0.3;
      const ringGradient = ctx.createLinearGradient(
        centerX - ringRadius, centerY - ringRadius,
        centerX + ringRadius, centerY + ringRadius
      );
      
      // Color gradient based on ring position and frequency
      if (r % 3 === 0) {
        // Purple to orange gradient
        ringGradient.addColorStop(0, `rgba(140, 80, 255, ${0.6 + midAvg * 0.002})`);
        ringGradient.addColorStop(0.5, `rgba(220, 120, 180, ${0.5 + midAvg * 0.002})`);
        ringGradient.addColorStop(1, `rgba(250, 170, 50, ${0.4 + midAvg * 0.002})`);
      } else if (r % 3 === 1) {
        // Blue to yellow
        ringGradient.addColorStop(0, `rgba(30, 174, 219, ${0.6 + midAvg * 0.002})`);
        ringGradient.addColorStop(0.5, `rgba(120, 200, 220, ${0.5 + midAvg * 0.002})`);
        ringGradient.addColorStop(1, `rgba(254, 247, 205, ${0.4 + midAvg * 0.002})`);
      } else {
        // Orange to purple
        ringGradient.addColorStop(0, `rgba(250, 170, 50, ${0.6 + midAvg * 0.002})`);
        ringGradient.addColorStop(0.5, `rgba(220, 100, 150, ${0.5 + midAvg * 0.002})`);
        ringGradient.addColorStop(1, `rgba(140, 80, 255, ${0.4 + midAvg * 0.002})`);
      }
      
      ctx.beginPath();
      
      // Draw distorted ring based on mid frequencies
      const segments = 120;
      const angleStep = (Math.PI * 2) / segments;
      const phase = Date.now() / 1000 * (r + 1) * 0.2;
      
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        
        // Create dynamic distortion
        const distortionFactor = Math.sin(angle * (r + 2) + phase) * distortionAmount;
        const radiusOffset = ringRadius * (1 + distortionFactor * (midAvg / 255));
        
        const x = centerX + Math.cos(angle) * radiusOffset;
        const y = centerY + Math.sin(angle) * radiusOffset;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = ringWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Add subtle glow to the rings
      ctx.shadowColor = r % 2 === 0 ? 
        `rgba(140, 80, 255, ${midAvg / 1000})` : 
        `rgba(250, 170, 50, ${midAvg / 1000})`;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw orbital light trails based on high frequencies
    const orbitalParticles = 60;
    const orbitalAngleStep = (Math.PI * 2) / orbitalParticles;
    const time = Date.now() / 1000;
    
    for (let i = 0; i < orbitalParticles; i++) {
      // Spread particles into different orbital rings
      const orbitalRingIndex = i % 3;
      const orbitalRadius = radius * (0.4 + orbitalRingIndex * 0.2);
      
      // Calculate particle position
      const speed = (0.2 + (trebleAvg / 255)) * (1 + orbitalRingIndex * 0.3);
      const angle = orbitalAngleStep * i + time * speed;
      
      const x = centerX + Math.cos(angle) * orbitalRadius;
      const y = centerY + Math.sin(angle) * orbitalRadius;
      
      // Particle size based on frequency
      const freqIndex = i % dataArray.length;
      const particleValue = dataArray[freqIndex] / 255;
      
      // Only draw particles when audio is above threshold
      if (particleValue > 0.05) {
        const particleSize = 1 + particleValue * 3;
        
        // Determine particle color based on orbital ring and frequency
        let particleColor;
        if (orbitalRingIndex === 0) {
          particleColor = `rgba(254, 247, 205, ${0.2 + particleValue * 0.8})`;
        } else if (orbitalRingIndex === 1) {
          particleColor = `rgba(250, 115, 26, ${0.2 + particleValue * 0.8})`;
        } else {
          particleColor = `rgba(140, 82, 255, ${0.2 + particleValue * 0.8})`;
        }
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        
        // Add glow to particles
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = 5 + particleValue * 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Add trail if particle is energetic enough
        if (particleValue > 0.5) {
          const trailLength = particleValue * 20;
          const trailGradient = ctx.createLinearGradient(
            x - Math.cos(angle) * trailLength, y - Math.sin(angle) * trailLength,
            x, y
          );
          
          trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          trailGradient.addColorStop(1, particleColor);
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - Math.cos(angle) * trailLength, 
            y - Math.sin(angle) * trailLength
          );
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = particleSize;
          ctx.stroke();
        }
      }
    }
    
    // Continue the animation loop
    requestAnimationRef.current = requestAnimationFrame(drawVisualizer);
  };
  
  // Helper function to calculate average frequency in a range
  const getAverageFrequency = (dataArray: Uint8Array, start: number, end: number): number => {
    let sum = 0;
    const count = Math.min(end, dataArray.length) - start;
    
    if (count <= 0) return 0;
    
    for (let i = start; i < Math.min(end, dataArray.length); i++) {
      sum += dataArray[i];
    }
    
    return sum / count;
  };
  
  // Add lens flare effect
  const addLensFlare = (ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) => {
    const flareSize = 5 + intensity * 0.3;
    const flareOpacity = 0.1 + (intensity / 255) * 0.3;
    
    // Add small bright center
    ctx.beginPath();
    ctx.arc(x, y, flareSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${flareOpacity * 2})`;
    ctx.fill();
    
    // Add larger flare around
    const flareGradient = ctx.createRadialGradient(
      x, y, flareSize / 3,
      x, y, flareSize * 2
    );
    
    flareGradient.addColorStop(0, `rgba(255, 255, 255, ${flareOpacity})`);
    flareGradient.addColorStop(0.5, `rgba(180, 160, 255, ${flareOpacity / 2})`);
    flareGradient.addColorStop(1, 'rgba(80, 80, 220, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, flareSize * 2, 0, Math.PI * 2);
    ctx.fillStyle = flareGradient;
    ctx.fill();
    
    // Add a few random beams
    const beamCount = 4;
    for (let i = 0; i < beamCount; i++) {
      const angle = (Math.PI * 2 / beamCount) * i + (Date.now() / 10000);
      const beamLength = flareSize * 3;
      
      const beamGradient = ctx.createLinearGradient(
        x, y,
        x + Math.cos(angle) * beamLength,
        y + Math.sin(angle) * beamLength
      );
      
      beamGradient.addColorStop(0, `rgba(255, 255, 255, ${flareOpacity})`);
      beamGradient.addColorStop(1, 'rgba(180, 160, 255, 0)');
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * beamLength,
        y + Math.sin(angle) * beamLength
      );
      ctx.strokeStyle = beamGradient;
      ctx.lineWidth = 1 + flareSize / 10;
      ctx.stroke();
    }
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
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
        }
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
