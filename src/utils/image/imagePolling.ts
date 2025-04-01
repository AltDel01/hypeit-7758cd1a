
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
 * Main function that polls for the result of an image generation request
 */
export async function pollForImageResult(params: PollImageParams): Promise<void> {
  const { 
    requestId, 
    prompt, 
    aspectRatio, 
    style,
    retries = 10, 
    delay = 3000, 
    maxRetries = 10 
  } = params;
  
  // Set maximum retries to prevent infinite polling
  const currentRetries = Math.min(retries, maxRetries);
  
  if (currentRetries <= 0) {
    handleMaxRetriesReached(prompt, aspectRatio);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    
    // Wait for the specified delay
    await delayExecution(delay);
    
    // Check the status of the image generation request
    const result = await checkImageStatus(requestId);
    
    // Handle the status check result
    await handleStatusCheckResult(result, {
      requestId, prompt, aspectRatio, style, 
      retries: currentRetries, delay, maxRetries
    });
    
  } catch (error) {
    handlePollingError(error, {
      requestId, prompt, aspectRatio, style,
      retries: currentRetries, delay, maxRetries
    });
  }
}

/**
 * Handles the case when maximum retries are reached
 */
function handleMaxRetriesReached(prompt: string, aspectRatio: string): void {
  console.log("Maximum polling retries reached");
  toast.error("Image generation is taking longer than expected");
  
  // Always provide a fallback image when maximum retries reached
  useFallbackImage(prompt, aspectRatio);
}

/**
 * Processes the result of a status check
 */
async function handleStatusCheckResult(
  result: ImageStatusResult, 
  params: PollImageParams
): Promise<void> {
  const { requestId, prompt, aspectRatio, style, retries, delay } = params;
  
  if (result.error) {
    handlePollingError(result.error, params);
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
      retries: retries - 1, delay, maxRetries: params.maxRetries
    });
    return;
  }
  
  // If we got an error from the API
  if (result.apiError) {
    handleApiError(result.apiError, prompt, aspectRatio);
    return;
  }
  
  // If we don't know the status, continue polling with a shorter retry count
  scheduleNextPoll({
    requestId, prompt, aspectRatio, style,
    retries: retries - 1, delay, maxRetries: params.maxRetries
  });
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string): void {
  console.error("Error from poll:", error);
  toast.error(`Image generation failed: ${error}`);
  
  // Use fallback image source
  useFallbackImage(prompt, aspectRatio);
}

/**
 * Interface representing the result of an image status check
 */
interface ImageStatusResult {
  error?: any;
  status?: string;
  imageUrl?: string;
  apiError?: any;
  data?: any;
}

/**
 * Calls the Supabase function to check the status of an image generation request
 */
async function checkImageStatus(requestId: string): Promise<ImageStatusResult> {
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
 */
async function delayExecution(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  setTimeout(() => pollForImageResult(params), params.delay);
}

/**
 * Handles errors that occur during polling
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
 */
async function processImageUrl(imageUrl: string, prompt: string): Promise<void> {
  try {
    // Check if this is an Unsplash URL
    if (imageUrl.includes('unsplash.com')) {
      const finalUrl = addCacheBusterToUrl(imageUrl);
      toast.success("Image generated successfully!");
      dispatchImageGeneratedEvent(finalUrl, prompt);
      return;
    }
    
    // For other URLs, dispatch directly without validation
    toast.success("Image generation completed!");
    dispatchImageGeneratedEvent(imageUrl, prompt);
    
  } catch (error) {
    console.error("Error processing image URL:", error);
    throw error;
  }
}

/**
 * Adds a cache-busting parameter to a URL
 */
function addCacheBusterToUrl(url: string): string {
  const cacheBuster = Date.now();
  return url.includes('?') 
    ? `${url}&t=${cacheBuster}` 
    : `${url}?t=${cacheBuster}`;
}

/**
 * Uses a fallback image when the primary generation fails
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
    handleFallbackError(error, prompt);
  }
}

/**
 * Handles errors during fallback image generation
 */
function handleFallbackError(error: any, prompt: string): void {
  console.error("Error generating fallback image:", error);
  
  // Ultimate fallback - use a fixed image URL if all else fails
  const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
  dispatchImageGeneratedEvent(emergencyFallback, prompt);
}
