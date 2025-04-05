
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Share2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ResultPreviewProps {
  resultImage: string | null;
  isLoading?: boolean;
  loadingProgress?: number;
  generationTime?: number;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ 
  resultImage, 
  isLoading = false,
  loadingProgress = 0,
  generationTime = 60 
}) => {
  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'inpainted-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (!resultImage) return;
    
    try {
      if (navigator.share) {
        // Get the blob from the url
        const response = await fetch(resultImage);
        const blob = await response.blob();
        const file = new File([blob], 'inpainted-image.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Inpainted Image',
          text: 'Check out this image I created!',
          files: [file]
        });
      } else {
        // Fallback - copy to clipboard
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        img.src = resultImage;
        await new Promise(resolve => {
          img.onload = resolve;
        });
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert('Image copied to clipboard!');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Unable to share image. Try downloading instead.');
    }
  };
  
  const LoadingAnimation = () => {
    const timeRemaining = Math.max(0, Math.ceil(generationTime * (1 - loadingProgress / 100)));
    
    return (
      <div className="flex items-center justify-center flex-col space-y-4">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl font-bold text-white">{timeRemaining}s</div>
          </div>
          <svg className="animate-spin h-full w-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="50%" stopColor="#8c52ff" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
              <filter id="glow">
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
              stroke="url(#progressGradient)" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray="283" 
              strokeDashoffset={283 * (1 - loadingProgress / 100)} 
              filter="url(#glow)"
              className="drop-shadow-[0_0_8px_rgba(140,82,255,0.8)]"
            />
          </svg>
        </div>
        <div className="w-full max-w-xs">
          <Progress value={loadingProgress} className="h-2 bg-gray-800">
            <div 
              className="h-full bg-gradient-to-r from-[#9b87f5] via-[#8c52ff] to-[#D946EF] rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </Progress>
        </div>
        <p className="text-center text-sm text-gray-400">
          Applying your prompt to the image...
          <br />
          <span className="text-xs text-gray-500">This may take up to a minute</span>
        </p>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Result</h3>
      {false ? (
        <div className="aspect-square w-full max-h-[500px] overflow-hidden rounded-md border bg-gray-900 flex items-center justify-center">
          <LoadingAnimation />
        </div>
      ) : resultImage ? (
        <div className="aspect-square w-full max-h-[500px] overflow-hidden rounded-md border">
          <img
            src={resultImage}
            alt="Inpainted result"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center aspect-square w-full max-h-[500px] rounded-md border bg-gray-900">
          <p className="text-gray-500">
            Inpainted image will appear here
          </p>
        </div>
      )}
      
      {resultImage && (
        <div className="flex space-x-2">
          <Button 
            variant="default"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResultPreview;
