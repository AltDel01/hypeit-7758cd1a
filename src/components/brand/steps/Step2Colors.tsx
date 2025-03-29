
import React from 'react';
import BrandColorPicker from '@/components/brand/BrandColorPicker';
import { FormLabel } from '@/components/ui/form';

interface Step2ColorsProps {
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
}

const Step2Colors: React.FC<Step2ColorsProps> = ({ 
  selectedColors, 
  setSelectedColors 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
      <p className="text-gray-400 mb-4">
        Select exactly 3 colors that represent your brand's personality.
      </p>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <BrandColorPicker
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          maxColors={3}
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Color Preview</h3>
        <div className="p-4 rounded-lg bg-gray-800">
          <div className="grid grid-cols-3 gap-4">
            {selectedColors.map((color, index) => (
              <div key={index} className="space-y-2">
                <div 
                  className="h-10 rounded-md" 
                  style={{ backgroundColor: color }}
                ></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">
                    {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Accent'}
                  </span>
                  <span className="text-xs font-mono">
                    {color.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Colors;
