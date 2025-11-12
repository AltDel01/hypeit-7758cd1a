
import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export interface HistoryState {
  objects: any[];
  index: number;
}

export interface DrawingCanvasHook {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
  activeTool: 'brush' | 'eraser' | 'rectangle' | 'circle';
  setActiveTool: (tool: 'brush' | 'eraser' | 'rectangle' | 'circle') => void;
  historyState: HistoryState;
  imageLoaded: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
  addRectangle: () => void;
  addCircle: () => void;
  clearMask: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useDrawingCanvas = (
  originalImage: File | null,
  onChange: (maskDataUrl: string) => void
): DrawingCanvasHook => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'rectangle' | 'circle'>('brush');
  const [historyState, setHistoryState] = useState<HistoryState>({
    objects: [],
    index: -1
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Initialize canvas when component mounts
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#f0f0f0',
      width: 500,
      height: 500,
    });

    // Configure brush
    const brush = canvas.freeDrawingBrush;
    brush.color = '#ffffff';
    brush.width = 20;

    fabricCanvasRef.current = canvas;

    // Save initial state to history
    saveToHistory();

    // Set up event listener for object modifications
    canvas.on('object:added', saveToHistory);
    canvas.on('object:modified', saveToHistory);
    canvas.on('path:created', saveToHistory);

    // Save mask data when changes occur
    canvas.on('mouse:up', () => {
      if (canvas.isDrawingMode) {
        sendMaskData();
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Load original image when it changes
  useEffect(() => {
    if (!originalImage || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const url = URL.createObjectURL(originalImage);

    // Clear canvas
    canvas.clear();
    setHistoryState({
      objects: [],
      index: -1
    });

    // Load image
    fabric.Image.fromURL(url, (img) => {
      // Calculate scale to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        canvasWidth / img.width!,
        canvasHeight / img.height!
      );

      // Resize canvas to match image aspect ratio
      const newWidth = img.width! * scale;
      const newHeight = img.height! * scale;
      canvas.setWidth(newWidth);
      canvas.setHeight(newHeight);

      // Scale image
      img.scale(scale);
      img.selectable = false;

      // Add image as background
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      
      // Save initial state
      saveToHistory();
      setImageLoaded(true);
      
      // Send blank mask initially
      sendMaskData();
    });

    return () => URL.revokeObjectURL(url);
  }, [originalImage]);

  // Update drawing mode when tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const brush = canvas.freeDrawingBrush;
    
    // Set drawing mode based on active tool
    if (activeTool === 'brush') {
      canvas.isDrawingMode = true;
      brush.color = '#ffffff';
      brush.width = 20;
    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = true;
      brush.color = '#00000000'; // Transparent
      brush.width = 20;
    } else {
      canvas.isDrawingMode = false;
    }
    
    canvas.renderAll();
  }, [activeTool]);

  // Save current state to history
  const saveToHistory = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // If we're not at the end of the history, remove future states
    if (historyState.index < historyState.objects.length - 1) {
      const newObjects = historyState.objects.slice(0, historyState.index + 1);
      setHistoryState({
        objects: newObjects,
        index: historyState.index
      });
    }
    
    // Get all objects as JSON
    const objects = canvas.getObjects();
    const serializedObjects = objects.map(obj => obj.toJSON());
    
    // Add current state to history
    setHistoryState(prev => {
      const newObjects = [...prev.objects, serializedObjects];
      const newIndex = newObjects.length - 1;
      
      // Limit history size
      if (newObjects.length > 20) {
        return {
          objects: newObjects.slice(1),
          index: newIndex - 1
        };
      }
      
      return {
        objects: newObjects,
        index: newIndex
      };
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (!fabricCanvasRef.current || historyState.index <= 0) return;
    
    setHistoryState(prev => ({
      ...prev,
      index: prev.index - 1
    }));
    
    loadFromHistory(historyState.index - 1);
  };

  // Redo last undone action
  const handleRedo = () => {
    if (!fabricCanvasRef.current || historyState.index >= historyState.objects.length - 1) return;
    
    setHistoryState(prev => ({
      ...prev,
      index: prev.index + 1
    }));
    
    loadFromHistory(historyState.index + 1);
  };

  // Load a state from history
  const loadFromHistory = (index: number) => {
    if (!fabricCanvasRef.current || !historyState.objects[index]) return;
    
    const canvas = fabricCanvasRef.current;
    const serializedObjects = historyState.objects[index];
    
    // Remove all objects
    canvas.remove(...canvas.getObjects());
    
    // Add objects from history
    serializedObjects.forEach(objData => {
      fabric.util.enlivenObjects([objData], (objects: fabric.Object[]) => {
        objects.forEach(obj => {
          canvas.add(obj);
        });
        canvas.renderAll();
        sendMaskData();
      });
    });
  };

  // Add a rectangle
  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const rect = new fabric.Rect({
      left: canvas.getWidth() / 2 - 50,
      top: canvas.getHeight() / 2 - 50,
      fill: '#ffffff',
      width: 100,
      height: 100,
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    saveToHistory();
    sendMaskData();
  };

  // Add a circle
  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const circle = new fabric.Circle({
      left: canvas.getWidth() / 2 - 50,
      top: canvas.getHeight() / 2 - 50,
      fill: '#ffffff',
      radius: 50,
    });
    
    canvas.add(circle);
    canvas.setActiveObject(circle);
    saveToHistory();
    sendMaskData();
  };

  // Clear all mask objects
  const clearMask = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.remove(...canvas.getObjects());
    saveToHistory();
    sendMaskData();
  };

  // Send mask data to parent component
  const sendMaskData = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Create a temporary canvas to generate mask
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.getWidth();
    tempCanvas.height = canvas.getHeight();
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Fill with black (transparent in mask)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw all objects in white
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      const objCanvas = obj.toCanvasElement();
      const matrix = obj.calcTransformMatrix();
      ctx.save();
      ctx.setTransform(
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3],
        matrix[4],
        matrix[5]
      );
      ctx.drawImage(objCanvas, -obj.width! / 2, -obj.height! / 2);
      ctx.restore();
    });
    
    // Convert to data URL and send to parent
    const dataUrl = tempCanvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  // Derived values for undo/redo button states
  const canUndo = historyState.index > 0;
  const canRedo = historyState.index < historyState.objects.length - 1;

  return {
    canvasRef,
    fabricCanvasRef,
    activeTool,
    setActiveTool,
    historyState,
    imageLoaded,
    handleUndo,
    handleRedo,
    addRectangle,
    addCircle,
    clearMask,
    canUndo,
    canRedo
  };
};
