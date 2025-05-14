
import React from 'react';

interface CircularProgressIndicatorProps {
  progress: number;
  size?: "small" | "medium" | "large";
  showPercentage?: boolean;
  gradientId?: string;
}

const CircularProgressIndicator = ({ 
  progress, 
  size = "medium", 
  showPercentage = true,
  gradientId = "circularProgressGradient"
}: CircularProgressIndicatorProps) => {
  // Calculate dimensions based on size
  const dimensions = {
    small: { size: 48, strokeWidth: 6 },
    medium: { size: 80, strokeWidth: 8 },
    large: { size: 128, strokeWidth: 10 }
  }[size];
  
  const { size: pixelSize, strokeWidth } = dimensions;
  
  // Calculate SVG parameters
  const center = pixelSize / 2;
  const radius = center - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);
  
  // Only animate spin when actively loading (progress between 1-99)
  const isLoading = progress > 0 && progress < 100;
  
  return (
    <div className="relative" style={{ height: pixelSize, width: pixelSize }}>
      <svg 
        className={isLoading ? "animate-spin h-full w-full" : "h-full w-full"} 
        style={{ animationDuration: '2s' }}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b87f5" />
            <stop offset="50%" stopColor="#8c52ff" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
          <filter id={`${gradientId}Glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feFlood floodColor="#8c52ff" floodOpacity="0.7" result="glow" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feComposite in="glow" in2="blur" operator="in" result="glowBlur" />
            <feBlend in="SourceGraphic" in2="glowBlur" mode="screen" />
          </filter>
        </defs>
        <circle 
          className="opacity-10" 
          cx={center} 
          cy={center} 
          r={radius} 
          stroke="#ffffff" 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        <circle 
          cx={center} 
          cy={center} 
          r={radius} 
          stroke={`url(#${gradientId})`} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          filter={`url(#${gradientId}Glow)`}
          className="drop-shadow-[0_0_6px_rgba(140,82,255,0.7)]"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-white ${size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-xl'}`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgressIndicator;
