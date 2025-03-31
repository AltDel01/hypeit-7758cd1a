
import React from 'react';
import { Button } from "@/components/ui/button";

interface MaskDrawingToggleProps {
  maskDrawingMode: boolean;
  setMaskDrawingMode: (mode: boolean) => void;
}

const MaskDrawingToggle: React.FC<MaskDrawingToggleProps> = ({
  maskDrawingMode,
  setMaskDrawingMode
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={maskDrawingMode ? "default" : "outline"}
        size="sm"
        onClick={() => setMaskDrawingMode(true)}
      >
        Draw Mask
      </Button>
      <Button
        type="button"
        variant={!maskDrawingMode ? "default" : "outline"}
        size="sm"
        onClick={() => setMaskDrawingMode(false)}
      >
        Upload Mask
      </Button>
    </div>
  );
};

export default MaskDrawingToggle;
