
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStableDiffusionInpainting } from '@/hooks/useStableDiffusionInpainting';
import InpaintingForm from './stable-diffusion/InpaintingForm';
import ResultPreview from './stable-diffusion/ResultPreview';

const StableDiffusionInpainting = () => {
  const { user } = useAuth();
  const inpainting = useStableDiffusionInpainting();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <InpaintingForm 
        isModelLoading={inpainting.isModelLoading}
        loadingStatus={inpainting.loadingStatus}
        loadingProgress={inpainting.loadingProgress}
        originalImage={inpainting.originalImage}
        setOriginalImage={inpainting.setOriginalImage}
        maskImage={inpainting.maskImage}
        setMaskImage={inpainting.setMaskImage}
        prompt={inpainting.prompt}
        setPrompt={inpainting.setPrompt}
        negativePrompt={inpainting.negativePrompt}
        setNegativePrompt={inpainting.setNegativePrompt}
        numInferenceSteps={inpainting.numInferenceSteps}
        setNumInferenceSteps={inpainting.setNumInferenceSteps}
        guidanceScale={inpainting.guidanceScale}
        setGuidanceScale={inpainting.setGuidanceScale}
        onGenerate={inpainting.generateInpaintedImage}
        isGenerating={inpainting.isGenerating}
        errorMessage={inpainting.errorMessage}
        useWebhook={inpainting.useWebhook}
        setUseWebhook={inpainting.setUseWebhook}
      />
      
      <ResultPreview 
        resultImage={inpainting.resultImage} 
        isLoading={inpainting.isGenerating}
        loadingProgress={inpainting.loadingProgress}
        generationTime={inpainting.generationTime}
      />
    </div>
  );
};

export default StableDiffusionInpainting;
