
import React from 'react';
import BrandColorPicker from '@/components/brand/BrandColorPicker';

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
        You can pick from our color palette or enter your own hex color codes.
      </p>
      
      <BrandColorPicker
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        maxColors={3}
      />
    </div>
  );
};

export default Step2Colors;
