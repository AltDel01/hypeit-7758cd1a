
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BrandColorPickerProps {
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  maxColors: number;
}

const BrandColorPicker: React.FC<BrandColorPickerProps> = ({ 
  selectedColors, 
  setSelectedColors,
  maxColors
}) => {
  const [open, setOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleColorSelect = () => {
    if (editIndex !== null) {
      // Edit existing color
      const newColors = [...selectedColors];
      newColors[editIndex] = currentColor;
      setSelectedColors(newColors);
      setEditIndex(null);
    } else if (selectedColors.length < maxColors) {
      // Add new color
      setSelectedColors([...selectedColors, currentColor]);
    }
    setOpen(false);
  };

  const handleColorEdit = (color: string, index: number) => {
    setCurrentColor(color);
    setEditIndex(index);
    setOpen(true);
  };

  const handleColorRemove = (index: number) => {
    setSelectedColors(selectedColors.filter((_, i) => i !== index));
  };

  const handleAddNewColor = () => {
    setCurrentColor('#3B82F6');
    setEditIndex(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        {selectedColors.map((color, index) => (
          <div 
            key={index}
            className="w-24 h-24 rounded-lg relative flex flex-col items-center justify-center border-2 border-white"
            style={{ backgroundColor: color }}
            onClick={() => handleColorEdit(color, index)}
          >
            <span className="text-xs font-mono mt-1 px-1 py-0.5 rounded bg-black bg-opacity-50 text-white">
              {color.toUpperCase()}
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleColorRemove(index);
              }}
            >
              ×
            </Button>
          </div>
        ))}
        
        {selectedColors.length < maxColors && (
          <div 
            onClick={handleAddNewColor}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <Plus className="h-8 w-8 text-gray-500" />
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Color" : "Add New Color"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <ColorPicker
              color={currentColor}
              onChange={setCurrentColor}
            />
            <div className="flex justify-end">
              <Button onClick={handleColorSelect}>
                {editIndex !== null ? "Update" : "Add"} Color
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <p className="text-sm text-gray-400">
        Select {maxColors} colors that represent your brand ({selectedColors.length}/{maxColors} selected)
      </p>
    </div>
  );
};

export default BrandColorPicker;
