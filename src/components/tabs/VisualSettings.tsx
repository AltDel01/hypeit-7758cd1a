
import React from 'react';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useNavigate } from 'react-router-dom';

interface VisualSettingsProps {
  selectedAspectRatio: string;
  selectedImagesPerBatch: number;
  onAspectRatioSelect: (ratio: string) => void;
  onImagesPerBatchSelect: (count: number) => void;
}

const VisualSettings = ({
  selectedAspectRatio,
  selectedImagesPerBatch,
  onAspectRatioSelect,
  onImagesPerBatchSelect
}: VisualSettingsProps) => {
  const { checkPremiumFeature, showPremiumModal, closePremiumModal } = usePremiumFeature();
  const navigate = useNavigate();

  const handleImagesPerBatchSelect = (count: number) => {
    if (count > 3) {
      const isPremium = checkPremiumFeature('Image Generation');
      if (isPremium) {
        // For premium users selecting large batches, just update the selection without notification
        onImagesPerBatchSelect(count);
      }
    } else {
      onImagesPerBatchSelect(count);
    }
  };

  return (
    <>
      <div className="w-full p-4 bg-gray-800 rounded-b-md">
        <div>
          <div className="text-sm font-medium text-white mb-3">Aspect Ratio</div>
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="aspectRatio" 
                checked={selectedAspectRatio === '1:1'} 
                onChange={() => onAspectRatioSelect('1:1')}
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
                onChange={() => onAspectRatioSelect('9:16')}
                className="sr-only"
              />
              <div className={`p-2 border ${selectedAspectRatio === '9:16' ? 'border-blue-500' : 'border-gray-600'} rounded-md flex items-center`}>
                <div className="w-6 h-10 bg-gray-600"></div>
                <span className="ml-2">9:16</span>
              </div>
            </label>
          </div>
          
          <div className="text-sm font-medium text-white mb-3">Images Per Batch</div>
          <div className="flex gap-2 mb-4">
            {[1, 3, 15, 25].map((count, index) => (
              <button
                key={count}
                onClick={() => handleImagesPerBatchSelect(count)}
                className={`rounded-full px-5 py-2 ${selectedImagesPerBatch === count ? 'bg-gray-600' : 'bg-gray-800 border border-gray-600'} ${index > 1 ? 'flex items-center' : ''}`}
              >
                <span>{count}</span>
                {index > 1 && (
                  <span className="ml-1 text-purple-400">💎</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <PremiumFeatureModal 
        isOpen={showPremiumModal} 
        onClose={closePremiumModal}
        feature="Image Generation"
      />
    </>
  );
};

export default VisualSettings;
