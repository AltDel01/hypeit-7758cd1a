
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Wand2, Upload, CircleOff } from 'lucide-react';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';
import SliderControl from './SliderControl';
import ModelLoader from './ModelLoader';
import MaskDrawingCanvas from './MaskDrawingCanvas';

interface InpaintingFormProps {
  isModelLoading: boolean;
  loadingStatus: string;
  loadingProgress: number;
  originalImage: File | null;
  setOriginalImage: (file: File) => void;
  maskImage: File | null;
  setMaskImage: (file: File) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  numInferenceSteps: number;
  setNumInferenceSteps: (steps: number) => void;
  guidanceScale: number;
  setGuidanceScale: (scale: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const InpaintingForm: React.FC<InpaintingFormProps> = ({
  isModelLoading,
  loadingStatus,
  loadingProgress,
  originalImage,
  setOriginalImage,
  maskImage,
  setMaskImage,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  numInferenceSteps,
  setNumInferenceSteps,
  guidanceScale,
  setGuidanceScale,
  onGenerate,
  isGenerating
}) => {
  const [maskDrawingMode, setMaskDrawingMode] = useState<boolean>(true);
  
  const handleOriginalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setOriginalImage(e.target.files[0]);
    }
  };

  const handleMaskImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaskImage(e.target.files[0]);
    }
  };
  
  const handleMaskDrawingChange = (maskDataUrl: string) => {
    // Convert data URL to File
    fetch(maskDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'mask.png', { type: 'image/png' });
        setMaskImage(file);
      })
      .catch(err => console.error('Error converting mask data URL to file:', err));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Stable Diffusion Inpainting</h2>
        <p className="text-gray-500 mb-4">
          Upload an image and draw a mask, then provide a prompt to inpaint the masked area.
        </p>
      </div>
      
      {isModelLoading ? (
        <ModelLoader loadingStatus={loadingStatus} loadingProgress={loadingProgress} />
      ) : (
        <div className="space-y-4">
          <ImageUploader
            id="original-image"
            label="Original Image"
            icon={<Upload size={16} />}
            onChange={handleOriginalImageUpload}
            image={originalImage}
          />
          
          {originalImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mask</h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={maskDrawingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMaskDrawingMode(true)}
                  >
                    Draw Mask
                  </Button>
                  <Button
                    type="button"
                    variant={!maskDrawingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMaskDrawingMode(false)}
                  >
                    Upload Mask
                  </Button>
                </div>
              </div>
              
              {maskDrawingMode ? (
                <MaskDrawingCanvas 
                  originalImage={originalImage}
                  onChange={handleMaskDrawingChange}
                />
              ) : (
                <ImageUploader
                  id="mask-image"
                  label="Mask Image (white areas will be inpainted)"
                  icon={<CircleOff size={16} />}
                  onChange={handleMaskImageUpload}
                  image={maskImage}
                />
              )}
            </div>
          )}
          
          <PromptInput
            id="prompt"
            label="Prompt"
            placeholder="Describe what you want to add to the masked area..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          <PromptInput
            id="negative-prompt"
            label="Negative Prompt (Optional)"
            placeholder="What you don't want to see..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
          />
          
          <SliderControl
            id="inference-steps"
            label="Inference Steps"
            min={10}
            max={50}
            step={1}
            value={numInferenceSteps}
            onChange={(value) => setNumInferenceSteps(value[0])}
          />
          
          <SliderControl
            id="guidance-scale"
            label="Guidance Scale"
            min={1}
            max={15}
            step={0.1}
            value={guidanceScale}
            onChange={(value) => setGuidanceScale(value[0])}
            displayValue={guidanceScale.toFixed(1)}
          />
          
          <Button
            className="w-full"
            disabled={isGenerating || !originalImage || !maskImage || !prompt}
            onClick={onGenerate}
          >
            {isGenerating ? "Generating..." : "Generate"}
            <Wand2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InpaintingForm;
