
import React, { forwardRef } from 'react';

interface PDFPreviewContainerProps {
  children: React.ReactNode;
}

const PDFPreviewContainer = forwardRef<HTMLDivElement, PDFPreviewContainerProps>(
  ({ children }, ref) => {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto overflow-hidden" 
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

PDFPreviewContainer.displayName = 'PDFPreviewContainer';

export default PDFPreviewContainer;
