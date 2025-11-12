
import React, { forwardRef } from 'react';

interface PDFPreviewContainerProps {
  children: React.ReactNode;
  isGenerating?: boolean;
  loadingProgress?: number;
}

const PDFPreviewContainer = forwardRef<HTMLDivElement, PDFPreviewContainerProps>(
  ({ children, isGenerating = false, loadingProgress = 0 }, ref) => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
        <div className="text-center mb-4">
          <h2 className="text-white text-xl font-semibold">PDF Preview</h2>
          <p className="text-gray-400 text-sm">Scroll to preview all pages</p>
        </div>
        
        {isGenerating ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-32 w-32">
                <svg className="animate-spin h-full w-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="pdfPreviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9b87f5" />
                      <stop offset="50%" stopColor="#8c52ff" />
                      <stop offset="100%" stopColor="#D946EF" />
                    </linearGradient>
                    <filter id="pdfPreviewGlow">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <circle 
                    className="opacity-10" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="#ffffff" 
                    strokeWidth="8" 
                    fill="none" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="url(#pdfPreviewGradient)" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 * (1 - loadingProgress / 100)} 
                    filter="url(#pdfPreviewGlow)"
                    className="drop-shadow-[0_0_8px_rgba(140,82,255,0.8)]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{Math.round(loadingProgress)}%</span>
                </div>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700">
                  <div 
                    className="h-full bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF] rounded-full transition-all"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-300">
                  Generating PDF preview...
                </p>
                <p className="text-xs text-center text-gray-500">
                  Our AI is carefully creating your PDF document. This typically takes around 30 seconds to ensure the highest quality results.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[800px] overflow-y-auto scrollbar-hide pb-4">
            <div 
              ref={ref} 
              className="flex flex-col items-center gap-8"
            >
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PDFPreviewContainer.displayName = 'PDFPreviewContainer';

export default PDFPreviewContainer;
