import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "sonner";
import stableDiffusionService from '@/services/StableDiffusionService';

const RESULT_EVENT_NAME = 'stableDiffusionResultReady';
const LOADING_TIMEOUT_MS = 3000; // 3 seconds

export function useStableDiffusionInpainting() {
  // == State == (Keep existing state)
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number>(0);

  // == Ref for the Timeout ==
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null); // Use NodeJS.Timeout for type safety, or number

  // == Clear Timeout Function ==
  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
      console.log("<<< HOOK: Cleared loading timeout >>>");
    }
  }, []);

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
    setIsGenerating(true);
    setResultImage(null);
    setErrorMessage(null);
    setGenerationStartTime(Date.now());
    clearLoadingTimeout(); // Clear any previous timeout

    toast.info("Sending image generation request...");
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

      console.log("Request sent. Waiting for result event OR timeout...");

      // --- Start the Timeout ---
      // Force stop loading after LOADING_TIMEOUT_MS milliseconds
      loadingTimerRef.current = setTimeout(() => {
        console.log(`<<< HOOK: ${LOADING_TIMEOUT_MS / 1000}s timeout elapsed. Forcing loading stop. >>>`);
        // Check if it wasn't already stopped by the event or an error
        // Setting state is safe, React handles batching/idempotency
        setIsGenerating(false);
        loadingTimerRef.current = null; // Clear ref after execution
      }, LOADING_TIMEOUT_MS);
      console.log(`<<< HOOK: Timeout set for ${LOADING_TIMEOUT_MS / 1000} seconds >>>`);

    } catch (error) {
      // Handle initial send error
      console.error("Error sending request to webhook:", error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsGenerating(false); // Stop loading on send error
      clearLoadingTimeout(); // Clear timeout if sending failed
    }
    // No finally block setting isGenerating
  }, [
    originalImage,
    maskImage,
    prompt,
    negativePrompt,
    numInferenceSteps,
    guidanceScale,
    clearLoadingTimeout // Add clear function to dependencies
  ]);

  // == Listener for Actual Result Event ==
  useEffect(() => {
    const handleResultReady = (event: Event) => {
      console.log("<<< HOOK: handleResultReady CALLED >>>", event.detail);
      clearLoadingTimeout(); // <<< Clear the timeout if the event arrives first

      const customEvent = event as CustomEvent<{ imageUrl: string; [key: string]: any }>;

      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string') {
        console.log(`<<< HOOK: Received image URL via event: ${customEvent.detail.imageUrl.substring(0,50)}... >>>`);
        setResultImage(customEvent.detail.imageUrl);
        toast.success("Image generated successfully!");
        setIsGenerating(false); // Stop loading (might be redundant if timeout already fired, but safe)
      } else {
        console.warn(`<<< HOOK: Received event, but detail format incorrect >>>:`, customEvent.detail);
        setErrorMessage("Received invalid result data from webhook.");
        toast.error("Received invalid result data.");
        setIsGenerating(false); // Stop loading even if data is bad
      }
    };

    console.log(`<<< HOOK: Adding listener for ${RESULT_EVENT_NAME} >>>`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady);

    // Cleanup
    return () => {
      console.log(`<<< HOOK: Removing listener for ${RESULT_EVENT_NAME} >>>`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady);
      clearLoadingTimeout(); // <<< Clear timeout on unmount
    };
  }, [clearLoadingTimeout]); // Add clear function to dependencies

  // == Kalkulasi Waktu (Optional - keep as is) ==
  const generationTime = isGenerating && generationStartTime > 0
    ? Math.max(1, Math.floor((Date.now() - generationStartTime) / 1000))
    : null;

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
    isGenerating,
    errorMessage,
    generationTime,
    generateInpaintedImage,
  };
}