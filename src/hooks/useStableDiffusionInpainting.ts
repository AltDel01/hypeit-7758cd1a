
// src/hooks/useStableDiffusionInpainting.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import stableDiffusionService from '@/services/StableDiffusionService';

// Name of the expected event from webhook
const RESULT_EVENT_NAME = 'imageGenerated';

export function useStableDiffusionInpainting() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useWebhook, setUseWebhook] = useState<boolean>(true);

  // Simplified generation function
  const generateInpaintedImage = useCallback(async () => {
    // Input validation
    if (!originalImage) {
      toast.error("Please upload an original image");
      return;
    }
    if (!maskImage) {
      toast.error("Please provide a mask image");
      return;
    }
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    console.log('[HOOK] Starting generation process');
    setIsGenerating(true);
    setResultImage(null);
    setErrorMessage(null);

    toast.info("Sending generation request...");

    try {
      // Send request to webhook
      await stableDiffusionService.sendImageToWebhook({
        image: originalImage, 
        mask: maskImage, 
        prompt, 
        negative_prompt: negativePrompt,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale
      });
      console.log('[HOOK] Request sent to webhook, waiting for response');
      // Don't set isGenerating to false here - it will be set when event is received
    } catch (error) {
      console.error('[HOOK] Error sending request:', error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsGenerating(false);
    }
  }, [originalImage, maskImage, prompt, negativePrompt, numInferenceSteps, guidanceScale]);

  // Event listener for webhook response
  useEffect(() => {
    const handleResultReady = (event: CustomEvent<{ imageUrl: string; [key: string]: any }>) => {
      console.log('[HOOK] Result event received:', event.type);
      
      if (event.detail && event.detail.imageUrl) {
        console.log('[HOOK] Image URL received:', event.detail.imageUrl.substring(0, 30) + '...');
        setResultImage(event.detail.imageUrl);
        toast.success("Image generated successfully!");
      } else {
        console.warn('[HOOK] Invalid response format');
        setErrorMessage("Received invalid result data");
        toast.error("Received invalid result data");
      }
      
      // Always set loading to false when we receive any response
      setIsGenerating(false);
    };

    // Add event listener
    console.log(`[HOOK] Adding listener for event: ${RESULT_EVENT_NAME}`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady as EventListener);

    // Cleanup listener
    return () => {
      console.log(`[HOOK] Removing listener for event: ${RESULT_EVENT_NAME}`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady as EventListener);
    };
  }, []);

  return {
    originalImage, setOriginalImage,
    maskImage, setMaskImage,
    prompt, setPrompt,
    negativePrompt, setNegativePrompt,
    numInferenceSteps, setNumInferenceSteps,
    guidanceScale, setGuidanceScale,
    resultImage,
    isGenerating,
    errorMessage,
    generateInpaintedImage,
    useWebhook, setUseWebhook,
  };
}
