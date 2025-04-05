
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStableDiffusionInpainting } from '@/hooks/useStableDiffusionInpainting';
import InpaintingForm from './stable-diffusion/InpaintingForm';
import { Loader2 } from 'lucide-react';

// Simple loading component
const SimpleLoadingIndicator = () => (
  <div className="flex items-center justify-center text-indigo-600 space-x-2 p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span>Generating image...</span>
  </div>
);

const StableDiffusionInpainting = () => {
  const { user } = useAuth();
  const inpainting = useStableDiffusionInpainting();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Input Column */}
      <InpaintingForm
        isModelLoading={false}
        loadingStatus=""
        loadingProgress={0}
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

      {/* Result Column */}
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Result</h2>

        {/* Result Container */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center p-1 aspect-square max-h-[512px]">
          {/* Loading State */}
          {inpainting.isGenerating && <SimpleLoadingIndicator />}

          {/* Result Image */}
          {!inpainting.isGenerating && inpainting.resultImage && (
            <img
              src={inpainting.resultImage}
              alt="Generated result"
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onLoad={() => console.log("Result image loaded successfully")}
              onError={() => console.error("Error loading result image")}
            />
          )}

          {/* Empty State */}
          {!inpainting.isGenerating && !inpainting.resultImage && (
            <div className="text-center text-gray-400 text-sm px-4">
              Generated image will appear here
            </div>
          )}
        </div>

        {/* Download Button (only shown when there's a result) */}
        {!inpainting.isGenerating && inpainting.resultImage && (
          <div className="flex space-x-2 mt-2 justify-end">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-1"
              onClick={() => {
                const link = document.createElement('a');
                link.href = inpainting.resultImage!;
                link.download = 'generated-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StableDiffusionInpainting;
