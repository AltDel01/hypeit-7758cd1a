
import React from 'react';
import { useDrawingCanvas } from './drawing/useDrawingCanvas';
import DrawingToolbar from './drawing/DrawingToolbar';
import CanvasContainer from './drawing/CanvasContainer';
import CanvasInstructions from './drawing/CanvasInstructions';

interface MaskDrawingCanvasProps {
  originalImage: File | null;
  onChange: (maskDataUrl: string) => void;
}

const MaskDrawingCanvas: React.FC<MaskDrawingCanvasProps> = ({ 
  originalImage, 
  onChange 
}) => {
  const {
    canvasRef,
    activeTool,
    setActiveTool,
    imageLoaded,
    handleUndo,
    handleRedo,
    addRectangle,
    addCircle,
    clearMask,
    canUndo,
    canRedo
  } = useDrawingCanvas(originalImage, onChange);

  return (
    <div className="space-y-4">
      <DrawingToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onAddRectangle={addRectangle}
        onAddCircle={addCircle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearMask={clearMask}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <CanvasContainer 
        isLoading={!imageLoaded} 
        originalImage={originalImage}
      >
        <canvas ref={canvasRef} className="max-w-full" />
      </CanvasContainer>
      
      <CanvasInstructions />
    </div>
  );
};

export default MaskDrawingCanvas;
