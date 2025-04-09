
import React from 'react';

interface AspectRatioSelectorProps {
  selectedAspectRatio: string;
  handleAspectRatioSelect: (ratio: string) => void;
}

const AspectRatioSelector = ({ 
  selectedAspectRatio, 
  handleAspectRatioSelect 
}: AspectRatioSelectorProps) => {
  return (
    <div>
      <div className="text-sm font-medium text-white mb-3">Aspect Ratio</div>
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="aspectRatio" 
            checked={selectedAspectRatio === '1:1'} 
            onChange={() => handleAspectRatioSelect('1:1')}
            className="sr-only"
          />
          <div className={`p-2 border ${selectedAspectRatio === '1:1' ? 'border-blue-500' : 'border-gray-600'} rounded-md flex items-center`}>
            <div className="w-10 h-10 bg-gray-600"></div>
            <span className="ml-2">1:1</span>
          </div>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="aspectRatio" 
            checked={selectedAspectRatio === '9:16'} 
            onChange={() => handleAspectRatioSelect('9:16')}
            className="sr-only"
          />
          <div className={`p-2 border ${selectedAspectRatio === '9:16' ? 'border-blue-500' : 'border-gray-600'} rounded-md flex items-center`}>
            <div className="w-6 h-10 bg-gray-600"></div>
            <span className="ml-2">9:16</span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AspectRatioSelector;
