
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
    if (stepNumber === 1) return 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_10px_rgba(220,38,38,0.5)]'; // Glowing red
    if (stepNumber === 2) return 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.5)]'; // Glowing yellow
    if (stepNumber === 3) return 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_10px_rgba(34,197,94,0.5)]'; // Glowing green
    return 'bg-gradient-to-br from-[#9b87f5] to-[#8c52ff] shadow-[0_0_10px_rgba(140,82,255,0.5)]'; // Glowing purple
  };
  
  const getTextColor = (stepNumber: number) => {
    // Yellow needs dark text
    return stepNumber === 2 ? 'text-gray-900' : 'text-white';
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              i + 1 === currentStep 
                ? getStepColor(i + 1)
                : i + 1 < currentStep 
                  ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                  : 'bg-gray-700'
            } transition-all duration-300`}
          >
            <span className={`font-medium ${
              i + 1 === currentStep || i + 1 < currentStep 
              ? getTextColor(i + 1) 
              : 'text-white'
            }`}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-2 bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(140,82,255,0.5)]"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ViralityProgressBar;
