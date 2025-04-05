import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "sonner";
import stableDiffusionService from '@/services/StableDiffusionService';

const RESULT_EVENT_NAME = 'stableDiffusionResultReady';
// No longer need LOADING_TIMEOUT_MS

export function useStableDiffusionInpainting() {
  // == State == (Keep existing state, but isGenerating won't be used effectively)
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  // We keep isGenerating state but never set it to true
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // generationStartTime won't be useful now either
  // const [generationStartTime, setGenerationStartTime] = useState<number>(0);

  // No longer need the timeout ref or clear function

  // == Function to Send Request ==
  const generateInpaintedImage = useCallback(async () => {
    // ... (keep existing validation logic) ...
    const missingItems = [];
    if (!originalImage) missingItems.push("original image");
    if (!maskImage) missingItems.push("mask image");
    if (!prompt) missingItems.push("prompt");

    if (missingItems.length > 0) {
      const errorMsg = `Please provide: ${missingItems.join(", ")}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // --- Start Process ---
    // setIsGenerating(true); // <<< REMOVED/COMMENTED OUT
    setResultImage(null); // Still clear previous result
    setErrorMessage(null);
    // setGenerationStartTime(Date.now()); // Not useful anymore

    toast.info("Sending image generation request..."); // Keep toast for some feedback
    console.log("Sending request to webhook with prompt:", prompt);

    try {
      // Send request (this part remains the same)
      await stableDiffusionService.sendImageToWebhook({
        image: originalImage,
        mask: maskImage,
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
      });

      console.log("Request sent. Waiting for result event...");
      // No timeout needed

    } catch (error) {
      // Handle initial send error
      console.error("Error sending request to webhook:", error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      // setIsGenerating(false); // Not needed, was never true
    }
  }, [
    originalImage,
    maskImage,
    prompt,
    negativePrompt,
    numInferenceSteps,
    guidanceScale
    // No dependencies for timeout needed
  ]);

  // == Listener for Actual Result Event ==
  useEffect(() => {
    const handleResultReady = (event: Event) => {
      console.log("<<< HOOK: handleResultReady CALLED >>>", event.detail);
      // No timeout to clear

      const customEvent = event as CustomEvent<{ imageUrl: string; [key: string]: any }>;

      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string') {
        console.log(`<<< HOOK: Received image URL via event: ${customEvent.detail.imageUrl.substring(0,50)}... >>>`);
        setResultImage(customEvent.detail.imageUrl); // Set the result
        toast.success("Image generated successfully!");
        // setIsGenerating(false); // Not needed, was never true
      } else {
        console.warn(`<<< HOOK: Received event, but detail format incorrect >>>:`, customEvent.detail);
        setErrorMessage("Received invalid result data from webhook.");
        toast.error("Received invalid result data.");
        // setIsGenerating(false); // Not needed, was never true
      }
    };

    console.log(`<<< HOOK: Adding listener for ${RESULT_EVENT_NAME} >>>`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady);

    // Cleanup
    return () => {
      console.log(`<<< HOOK: Removing listener for ${RESULT_EVENT_NAME} >>>`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady);
      // No timeout to clear
    };
  }, []); // Empty dependency array is fine

  // == Kalkulasi Waktu (Will always be null) ==
  const generationTime = null; // isGenerating is always false

  // == Return Values == (Keep as is)
  return {
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
    resultImage,
    isGenerating, // Will always be false
    errorMessage,
    generationTime, // Will always be null
    generateInpaintedImage,
  };
}