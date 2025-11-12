
import React from 'react';
import { Brush, Eraser, Square, Circle, Undo, Redo, Trash2 } from 'lucide-react';
import ToolbarButton from './ToolbarButton';

interface DrawingToolbarProps {
  activeTool: 'brush' | 'eraser' | 'rectangle' | 'circle';
  setActiveTool: (tool: 'brush' | 'eraser' | 'rectangle' | 'circle') => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearMask: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  setActiveTool,
  onAddRectangle,
  onAddCircle,
  onUndo,
  onRedo,
  onClearMask,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <ToolbarButton
        icon={Brush}
        active={activeTool === 'brush'}
        onClick={() => setActiveTool('brush')}
        title="Brush"
      />
      <ToolbarButton
        icon={Eraser}
        active={activeTool === 'eraser'}
        onClick={() => setActiveTool('eraser')}
        title="Eraser"
      />
      <ToolbarButton
        icon={Square}
        active={activeTool === 'rectangle'}
        onClick={() => {
          setActiveTool('rectangle');
          onAddRectangle();
        }}
        title="Rectangle"
      />
      <ToolbarButton
        icon={Circle}
        active={activeTool === 'circle'}
        onClick={() => {
          setActiveTool('circle');
          onAddCircle();
        }}
        title="Circle"
      />
      <ToolbarButton
        icon={Undo}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      />
      <ToolbarButton
        icon={Redo}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
      />
      <ToolbarButton
        icon={Trash2}
        onClick={onClearMask}
        variant="destructive"
        title="Clear Mask"
      />
    </div>
  );
};

export default DrawingToolbar;
