
import React from 'react';
import MaskDrawingToggle from '../controls/MaskDrawingToggle';
import MaskDrawingCanvas from '../MaskDrawingCanvas';
import ImageUploader from '../ImageUploader';
import { CircleOff } from 'lucide-react';

interface MaskSectionProps {
  originalImage: File | null;
  maskImage: File | null;
  setMaskImage: (file: File) => void;
  maskDrawingMode: boolean;
  setMaskDrawingMode: (mode: boolean) => void;
  onMaskDrawingChange: (maskDataUrl: string) => void;
  onMaskImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMaskImage: () => void;
}

const MaskSection: React.FC<MaskSectionProps> = ({
  originalImage,
  maskImage,
  setMaskImage,
  maskDrawingMode,
  setMaskDrawingMode,
  onMaskDrawingChange,
  onMaskImageUpload,
  onRemoveMaskImage
}) => {
  if (!originalImage) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Mask</h3>
        <MaskDrawingToggle 
          maskDrawingMode={maskDrawingMode} 
          setMaskDrawingMode={setMaskDrawingMode} 
        />
      </div>
      
      {maskDrawingMode ? (
        <MaskDrawingCanvas 
          originalImage={originalImage}
          onChange={onMaskDrawingChange}
        />
      ) : (
        <ImageUploader
          id="mask-image"
          label="Mask Image (white areas will be inpainted)"
          icon={<CircleOff size={16} />}
          onChange={onMaskImageUpload}
          image={maskImage}
          onRemoveImage={onRemoveMaskImage}
        />
      )}
    </div>
  );
};

export default MaskSection;
