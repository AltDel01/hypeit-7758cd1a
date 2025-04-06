
import { toast } from "sonner";
import { PollImageParams, ImageStatusResult } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { processImageUrl } from "./imageProcessor";
import { useFallbackImage } from "./fallbackHandler";
import { checkValidImageUrl } from '../imageValidation';

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
  
  // If we have an error in the result, handle it
  if (result.error) {
    console.error("Error in polling result:", result.error);
    handlePollingError(result.error, params);
    return;
  }
  
  // If we have an image URL, validate and use it
  if (result.imageUrl && checkValidImageUrl(result.imageUrl)) {
    console.log("Valid image URL received:", result.imageUrl);
    await processImageUrl(result.imageUrl, prompt);
    return;
  }
  
  // If the API returned an error, handle it
  if (result.apiError) {
    console.error(`Received API error: ${result.apiError}`);
    handleApiError(result.apiError, prompt, aspectRatio);
    return;
  }
  
  // Handle different status responses
  if (result.status === "processing" || result.status === "accepted") {
    console.log(`Image still processing, scheduling next poll in ${delay}ms`);
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: retries - 1, 
      delay: Math.min(delay + 1000, 8000), // Gradually increase delay, max 8 seconds
      maxRetries: params.maxRetries
    });
    return;
  }
  
  // If we got a completed status but no valid image URL, use fallback
  if (result.status === "completed" && (!result.imageUrl || !checkValidImageUrl(result.imageUrl))) {
    console.log("Completed status received but no valid image URL, using fallback");
    useFallbackImage(prompt, aspectRatio);
    return;
  }
  
  // If we have an unexpected status, continue polling with fewer retries
  if (!result.status || (result.status !== "completed" && result.status !== "processing" && result.status !== "accepted")) {
    console.log(`Unexpected status: ${result.status || "undefined"}, continuing polling`);
    
    // Use a shorter retry count for unexpected statuses
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: Math.min(retries - 1, 3), // Reduce retries more aggressively for unexpected statuses
      delay, 
      maxRetries: params.maxRetries
    });
    return;
  }
  
  // Default case: continue polling normally
  console.log(`Status: ${result.status}, continuing polling`);
  scheduleNextPoll({
    requestId, prompt, aspectRatio, style,
    retries: retries - 1, 
    delay, 
    maxRetries: params.maxRetries
  });
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string): void {
  console.error("Error from API:", error);
  toast.error(`Image generation failed: ${error}`);
  
  // Use fallback image source
  useFallbackImage(prompt, aspectRatio);
}

/**
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  // Use setTimeout instead of direct recursion to prevent stack overflow
  setTimeout(() => pollForImageResult(params), 50);
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.error("Error in polling:", error);
  
  // Use a shorter retry interval when there are exceptions
  const shorterDelay = Math.max(1000, params.delay / 2);
  
  // If we've had multiple errors, use a fallback
  if (params.retries <= 3) {
    console.log("Too many polling errors, using fallback image");
    handleMaxRetriesReached(params.prompt, params.aspectRatio);
    return;
  }
  
  // Schedule another poll with reduced retries
  setTimeout(() => pollForImageResult({
    ...params,
    retries: params.retries - 1,
    delay: shorterDelay
  }), shorterDelay);
}
