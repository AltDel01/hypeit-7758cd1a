import React from 'react';
import BrollStudio from './video-editor/BrollStudio';

const AIVideoEditor: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 animate-gradient-text">
          Editor
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          AI video editing, upload a video and let AI plan, generate and insert cutaways
        </p>
      </div>

      <BrollStudio />
    </div>
  );
};

export default AIVideoEditor;

