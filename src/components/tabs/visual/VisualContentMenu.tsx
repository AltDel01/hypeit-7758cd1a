
import React from 'react';
import AspectRatioSelector from './AspectRatioSelector';
import ImagesPerBatchSelector from './ImagesPerBatchSelector';

interface VisualContentMenuProps {
  selectedAspectRatio: string;
  handleAspectRatioSelect: (ratio: string) => void;
  selectedImagesPerBatch: number;
  setSelectedImagesPerBatch: (count: number) => void;
}

const VisualContentMenu = ({
  selectedAspectRatio,
  handleAspectRatioSelect,
  selectedImagesPerBatch,
  setSelectedImagesPerBatch
}: VisualContentMenuProps) => {
  return (
    <div className="w-full p-4 bg-gray-800 rounded-b-md">
      <AspectRatioSelector 
        selectedAspectRatio={selectedAspectRatio} 
        handleAspectRatioSelect={handleAspectRatioSelect} 
      />
      
      <ImagesPerBatchSelector 
        selectedImagesPerBatch={selectedImagesPerBatch} 
        setSelectedImagesPerBatch={setSelectedImagesPerBatch} 
      />
    </div>
  );
};

export default VisualContentMenu;
