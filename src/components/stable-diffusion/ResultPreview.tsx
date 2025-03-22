
import React from 'react';
import { Button } from "@/components/ui/button";

interface ResultPreviewProps {
  resultImage: string | null;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ resultImage }) => {
  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'inpainted-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Result</h3>
      {resultImage ? (
        <div className="aspect-square w-full max-h-[500px] overflow-hidden rounded-md border">
          <img
            src={resultImage}
            alt="Inpainted result"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center aspect-square w-full max-h-[500px] rounded-md border bg-gray-50">
          <p className="text-gray-500">
            Inpainted image will appear here
          </p>
        </div>
      )}
      
      {resultImage && (
        <Button 
          variant="outline"
          className="w-full"
          onClick={handleDownload}
        >
          Download Result
        </Button>
      )}
    </div>
  );
};

export default ResultPreview;
