
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateFallbackImage } from './imageFallback';
import { dispatchImageGeneratedEvent } from './imageEvents';
import { isValidImageUrl } from './imageValidation';

export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries?: number;
  delay?: number;
  maxRetries?: number;
}

/**
 * Polls for the result of an image generation request
 * 
 * @param params - The polling parameters
 * @returns A promise that resolves when polling is complete
 */
export async function pollForImageResult({
  requestId,
  prompt,
  aspectRatio,
  style,
  retries = 10,
  delay = 3000,
  maxRetries = 10
}: PollImageParams): Promise<void> {
  // Set maximum retries to prevent infinite polling
  const currentRetries = Math.min(retries, maxRetries);
  
  if (currentRetries <= 0) {
    console.log("Maximum polling retries reached");
    toast.error("Image generation is taking longer than expected");
    
    // Always provide a fallback image when maximum retries reached
    await useFallbackImage(prompt, aspectRatio);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    
    // Wait for the specified delay
    await delayExecution(delay);
    
    // Check the status of the image generation request
    const result = await checkImageStatus(requestId);
    
    if (result.error) {
      handlePollingError(result.error, {
        requestId, prompt, aspectRatio, style, 
        retries: currentRetries, delay
      });
      return;
    }
    
    // If we have an image URL, validate and use it
    if (result.imageUrl && isValidImageUrl(result.imageUrl)) {
      await processImageUrl(result.imageUrl, prompt);
      return;
    }
    
    // Handle different status responses
    if (result.status === "processing" || result.status === "accepted") {
      scheduleNextPoll({
        requestId, prompt, aspectRatio, style,
        retries: currentRetries - 1, delay
      });
      return;
    }
    
    // If we got an error from the API
    if (result.apiError) {
      console.error("Error from poll:", result.apiError);
      toast.error(`Image generation failed: ${result.apiError}`);
      
      // Use fallback image source
      await useFallbackImage(prompt, aspectRatio);
      return;
    }
    
    // If we don't know the status, continue polling with a shorter retry count
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: currentRetries - 1, delay
    });
    
  } catch (error) {
    handlePollingError(error, {
      requestId, prompt, aspectRatio, style,
      retries: currentRetries, delay
    });
  }
}

/**
 * Calls the Supabase function to check the status of an image generation request
 * 
 * @param requestId - The ID of the image generation request to check
 * @returns The status check result
 */
async function checkImageStatus(requestId: string) {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: {
      requestId,
      checkOnly: true // Add a flag to indicate this is just a status check
    }
  });
  
  if (error) {
    return { error };
  }
  
  console.log("Poll response:", data);
  
  return { 
    status: data?.status,
    imageUrl: data?.imageUrl,
    apiError: data?.error,
    data
  };
}

/**
 * Delays execution for the specified time
 * 
 * @param ms - The delay in milliseconds
 * @returns A promise that resolves after the delay
 */
async function delayExecution(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Schedules the next polling attempt
 * 
 * @param params - The polling parameters
 */
function scheduleNextPoll(params: PollImageParams): void {
  setTimeout(() => pollForImageResult(params), params.delay);
}

/**
 * Handles errors that occur during polling
 * 
 * @param error - The error that occurred
 * @param params - The polling parameters
 */
function handlePollingError(error: any, params: PollImageParams): void {
  console.error("Error in polling:", error);
  // Use a shorter retry interval when there are exceptions
  const shorterDelay = Math.max(1000, params.delay / 2);
  
  setTimeout(() => pollForImageResult({
    ...params,
    retries: params.retries - 1,
    delay: shorterDelay
  }), shorterDelay);
}

/**
 * Processes an image URL by validating and dispatching the event
 * 
 * @param imageUrl - The URL of the generated image
 * @param prompt - The prompt used to generate the image
 */
async function processImageUrl(imageUrl: string, prompt: string): Promise<void> {
  try {
    // Check if this is an Unsplash URL
    if (imageUrl.includes('unsplash.com')) {
      // For Unsplash, add a cache-busting parameter and directly use it
      const cacheBuster = Date.now();
      const finalUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${cacheBuster}` 
        : `${imageUrl}?t=${cacheBuster}`;
      
      toast.success("Image generated successfully!");
      dispatchImageGeneratedEvent(finalUrl, prompt);
      return;
    }
    
    // For other URLs, dispatch directly without validation to avoid additional requests
    toast.success("Image generation completed!");
    dispatchImageGeneratedEvent(imageUrl, prompt);
    
  } catch (error) {
    console.error("Error processing image URL:", error);
    throw error;
  }
}

/**
 * Uses a fallback image when the primary generation fails
 * 
 * @param prompt - The prompt used to generate the image
 * @param aspectRatio - The aspect ratio of the image
 */
async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  // Show toast only once
  toast.info("Using alternative image source", { id: "fallback-image" });
  
  try {
    // Generate a more tailored fallback based on aspect ratio
    const imageSize = aspectRatio === "9:16" ? "800x1400" : "800x800";
    
    // Generate and dispatch the fallback image
    generateFallbackImage(prompt, imageSize);
  } catch (error) {
    console.error("Error generating fallback image:", error);
    
    // Ultimate fallback - use a fixed image URL if all else fails
    const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
    dispatchImageGeneratedEvent(emergencyFallback, prompt);
  }
}
