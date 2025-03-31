
import React from 'react';

const CanvasInstructions: React.FC = () => {
  return (
    <p className="text-sm text-gray-500">
      Draw with white to mark areas to be inpainted. Draw with the eraser or black to unmask areas.
    </p>
  );
};

export default CanvasInstructions;
