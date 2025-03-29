
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BrandColorPickerProps {
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  maxColors: number;
}

const colorOptions = [
  // Neutrals
  '#FFFFFF', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0A0A0A', 
  
  // Blues
  '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A',
  
  // Greens
  '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D',
  
  // Reds
  '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D',
  
  // Purples
  '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87',
  
  // Yellows
  '#FEFCE8', '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#713F12',
  
  // Oranges
  '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12',
  
  // Teals
  '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A',
];

const BrandColorPicker: React.FC<BrandColorPickerProps> = ({ 
  selectedColors, 
  setSelectedColors,
  maxColors
}) => {
  const handleColorClick = (color: string) => {
    if (selectedColors.includes(color)) {
      // Remove color if already selected
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < maxColors) {
      // Add color if not at max
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-6">
        {selectedColors.map((color, index) => (
          <div 
            key={index}
            className="w-20 h-20 rounded-lg relative flex flex-col items-center justify-center border-2 border-white"
            style={{ backgroundColor: color }}
          >
            <span className="text-xs font-mono mt-1 px-1 py-0.5 rounded bg-black bg-opacity-50 text-white">
              {color.toUpperCase()}
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={() => setSelectedColors(selectedColors.filter((_, i) => i !== index))}
            >
              ×
            </Button>
          </div>
        ))}
        
        {Array.from({ length: maxColors - selectedColors.length }).map((_, i) => (
          <div 
            key={`empty-${i}`}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center"
          >
            <span className="text-gray-500 text-sm">Select</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400">
        Select {maxColors} colors that represent your brand ({selectedColors.length}/{maxColors} selected)
      </p>
      
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-2">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
              selectedColors.includes(color) ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            disabled={selectedColors.length >= maxColors && !selectedColors.includes(color)}
          >
            {selectedColors.includes(color) && (
              <Check size={16} className={getContrastColor(color) === 'white' ? 'text-white' : 'text-black'} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to determine if text should be black or white based on background color
function getContrastColor(hexColor: string): 'black' | 'white' {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark
  return luminance > 0.5 ? 'black' : 'white';
}

export default BrandColorPicker;
