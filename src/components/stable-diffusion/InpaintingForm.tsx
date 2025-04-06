
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ModelLoader from './ModelLoader';
import FormHeader from './sections/FormHeader';
import MaskSection from './sections/MaskSection';
import PromptSection from './sections/PromptSection';
import WebhookToggle from './controls/WebhookToggle';
import GenerateButton from './controls/GenerateButton';

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
  errorMessage?: string | null;
  useWebhook?: boolean;
  setUseWebhook?: (useWebhook: boolean) => void;
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
  isGenerating,
  errorMessage,
  useWebhook = false,
  setUseWebhook
}) => {
  const [maskDrawingMode, setMaskDrawingMode] = useState<boolean>(true);
  
  const handleOriginalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Original image selected:", e.target.files[0].name, e.target.files[0].size);
      setOriginalImage(e.target.files[0]);
    }
  };

  const handleMaskImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Mask image selected:", e.target.files[0].name, e.target.files[0].size);
      setMaskImage(e.target.files[0]);
    }
  };
  
  const handleMaskDrawingChange = (maskDataUrl: string) => {
    // Convert data URL to File
    console.log("Mask drawing changed, converting to file");
    fetch(maskDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'mask.png', { type: 'image/png' });
        console.log("Mask file created:", file.size);
        setMaskImage(file);
      })
      .catch(err => console.error('Error converting mask data URL to file:', err));
  };
  
  const handleRemoveOriginalImage = () => {
    setOriginalImage(null);
    if (maskImage) setMaskImage(null);
  };
  
  const handleRemoveMaskImage = () => {
    setMaskImage(null);
  };

  return (
    <div className="space-y-6">
      <FormHeader errorMessage={errorMessage} />
      
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
            onRemoveImage={handleRemoveOriginalImage}
          />
          
          <MaskSection
            originalImage={originalImage}
            maskImage={maskImage}
            setMaskImage={setMaskImage}
            maskDrawingMode={maskDrawingMode}
            setMaskDrawingMode={setMaskDrawingMode}
            onMaskDrawingChange={handleMaskDrawingChange}
            onMaskImageUpload={handleMaskImageUpload}
            onRemoveMaskImage={handleRemoveMaskImage}
          />
          
          <PromptSection
            prompt={prompt}
            setPrompt={setPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            numInferenceSteps={numInferenceSteps}
            setNumInferenceSteps={setNumInferenceSteps}
            guidanceScale={guidanceScale}
            setGuidanceScale={setGuidanceScale}
          />
          
          {setUseWebhook && (
            <WebhookToggle 
              useWebhook={useWebhook} 
              setUseWebhook={setUseWebhook} 
            />
          )}
          
          <GenerateButton
            isGenerating={isGenerating}
            disabled={!originalImage || !maskImage || !prompt}
            onClick={onGenerate}
          />
        </div>
      )}
    </div>
  );
};

export default InpaintingForm;
