
import React from 'react';

interface ImagesPerBatchSelectorProps {
  selectedImagesPerBatch: number;
  setSelectedImagesPerBatch: (count: number) => void;
}

const ImagesPerBatchSelector = ({ 
  selectedImagesPerBatch, 
  setSelectedImagesPerBatch 
}: ImagesPerBatchSelectorProps) => {
  return (
    <div>
      <div className="text-sm font-medium text-white mb-3">Images Per Batch</div>
      <div className="flex gap-2 mb-4">
        {[1, 3, 15, 25].map((count, index) => (
          <button
            key={count}
            onClick={() => setSelectedImagesPerBatch(count)}
            className={`rounded-full px-5 py-2 ${selectedImagesPerBatch === count ? 'bg-gray-600' : 'bg-gray-800 border border-gray-600'} ${index > 1 ? 'flex items-center' : ''}`}
          >
            <span>{count}</span>
            {index > 1 && (
              <span className="ml-1 text-yellow-400">💎</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImagesPerBatchSelector;
