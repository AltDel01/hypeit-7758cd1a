
import { toast } from "sonner";
import { PollImageParams, ImageStatusResult } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { processImageUrl } from "./imageProcessor";
import { useFallbackImage } from "./fallbackHandler";
import { isValidImageUrl } from '../imageValidation';

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
export async function handleStatusCheckResult(
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
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  setTimeout(() => pollForImageResult(params), params.delay);
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.error("Error in polling:", error);
  // Use a shorter retry interval when there are exceptions
  const shorterDelay = Math.max(1000, params.delay / 2);
  
  setTimeout(() => pollForImageResult({
    ...params,
    retries: params.retries - 1,
    delay: shorterDelay
  }), shorterDelay);
}
