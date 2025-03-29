
import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              i + 1 === currentStep 
                ? 'bg-blue-600' 
                : i + 1 < currentStep 
                  ? 'bg-green-600' 
                  : 'bg-gray-700'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-700 rounded-full">
        <div 
          className="h-2 bg-blue-600 rounded-full transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FormProgress;
