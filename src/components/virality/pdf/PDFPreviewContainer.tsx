
import React, { forwardRef } from 'react';

interface PDFPreviewContainerProps {
  children: React.ReactNode;
}

const PDFPreviewContainer = forwardRef<HTMLDivElement, PDFPreviewContainerProps>(
  ({ children }, ref) => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
        <div className="text-center mb-4">
          <h2 className="text-white text-xl font-semibold">PDF Preview</h2>
          <p className="text-gray-400 text-sm">Scroll to preview all pages</p>
        </div>
        
        <div className="max-h-[800px] overflow-y-auto scrollbar-hide pb-4">
          <div 
            ref={ref} 
            className="flex flex-col items-center gap-8"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

PDFPreviewContainer.displayName = 'PDFPreviewContainer';

export default PDFPreviewContainer;
