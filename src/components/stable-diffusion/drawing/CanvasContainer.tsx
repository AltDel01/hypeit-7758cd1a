
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-10">
          <div className="text-center space-y-3">
            <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-300/50" />
            <p className="text-gray-600 font-medium animate-pulse">Loading image...</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default CanvasContainer;
