
import React from 'react';

interface ViralityProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ViralityProgressBar: React.FC<ViralityProgressBarProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  // Helper function to determine step color
  const getStepColor = (stepNumber: number) => {
    if (stepNumber === 1) return 'bg-[#cc0000]'; // Deep red for step 1
    if (stepNumber === 2) return 'bg-[#ffcc00]'; // Deep yellow for step 2
    if (stepNumber === 3) return 'bg-green-600'; // Keep green for step 3
    return 'bg-[#8c52ff]'; // Default to purple for other steps
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              i + 1 === currentStep 
                ? getStepColor(i + 1)
                : i + 1 < currentStep 
                  ? 'bg-green-600' 
                  : 'bg-gray-700'
            }`}
          >
            {/* For yellow step, use dark text */}
            <span className={`font-medium ${i + 1 === 2 && (i + 1 === currentStep || i + 1 < currentStep) ? 'text-gray-900' : 'text-white'}`}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-700 rounded-full">
        <div 
          className="h-2 bg-[#8c52ff] rounded-full transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ViralityProgressBar;
