
import React from 'react';

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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading image...</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default CanvasContainer;
