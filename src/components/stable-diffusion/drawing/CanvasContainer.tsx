
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CanvasContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  originalImage: File | null;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ 
  children, 
  isLoading,
  originalImage 
}) => {
  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden">
      {isLoading && originalImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10">
          <div className="text-center space-y-3">
            <div className="relative h-16 w-16 mx-auto">
              <svg className="animate-spin h-full w-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="canvasContainerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9b87f5" />
                    <stop offset="50%" stopColor="#8c52ff" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                  <filter id="canvasContainerGlow">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle 
                  className="opacity-10" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="#ffffff" 
                  strokeWidth="8" 
                  fill="none" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="url(#canvasContainerGradient)" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="283" 
                  strokeDashoffset="70"
                  filter="url(#canvasContainerGlow)"
                  className="drop-shadow-[0_0_8px_rgba(140,82,255,0.8)]"
                />
              </svg>
            </div>
            <p className="text-gray-300 font-medium animate-pulse">Processing image...</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default CanvasContainer;
