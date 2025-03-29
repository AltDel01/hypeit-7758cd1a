
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft } from 'lucide-react';

interface PDFControlsProps {
  onGeneratePDF: () => void;
  onBack: () => void;
}

const PDFControls: React.FC<PDFControlsProps> = ({ onGeneratePDF, onBack }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="border-gray-700 text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
      </Button>
      <Button
        onClick={onGeneratePDF}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <FileDown className="mr-2 h-4 w-4" /> Download PDF
      </Button>
    </div>
  );
};

export default PDFControls;
