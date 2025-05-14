import { toast } from "sonner";
import { PollImageParams, ImageStatusResult } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { processImageUrl } from "./imageProcessor";
import { useFallbackImage } from "./fallbackHandler";
import { forceImageGenerationRetry, dispatchImageGenerationErrorEvent } from '../imageEvents';
import { POLLING_CONFIG, calculateNextDelay, isValidResponse, isProcessing } from './pollingUtils';

const activePolls = new Map<string, boolean>();

export async function pollForImageResult(params: PollImageParams): Promise<void> {
  const { 
    requestId, 
    prompt, 
    aspectRatio, 
    style,
    retries = POLLING_CONFIG.MAX_RETRIES, 
    delay = POLLING_CONFIG.INITIAL_DELAY, 
    maxRetries = POLLING_CONFIG.MAX_RETRIES 
  } = params;
  
  if (activePolls.get(requestId)) {
    console.log(`Already polling for requestId: ${requestId}`);
    return;
  }
  
  activePolls.set(requestId, true);
  
  const currentRetries = Math.min(retries, maxRetries);
  
  if (currentRetries <= 0) {
    handleMaxRetriesReached(prompt, aspectRatio, requestId);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    await delayExecution(delay);
    
    const result = await checkImageStatus(requestId);
    await handleStatusCheckResult(result, {
      ...params,
      retries: currentRetries,
      delay
    });
  } catch (error) {
    handlePollingError(error, params);
  } finally {
    if (currentRetries <= 1) {
      activePolls.delete(requestId);
      console.log(`Removed ${requestId} from active polls`);
    }
  }
}

/**
 * Handles the case when maximum retries are reached
 */
function handleMaxRetriesReached(prompt: string, aspectRatio: string, requestId: string): void {
  console.log(`Maximum polling retries reached for request ${requestId}`);
  toast.error("Image generation timed out", { id: "generation-timeout" });
  
  activePolls.delete(requestId);
  
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
    console.error(`Error in polling result for ${requestId}:`, result.error);
    handlePollingError(result.error, params);
    return;
  }
  
  if (result.apiError && result.apiError.includes("API key") && result.apiError.includes("not")) {
    console.error(`Critical API error: ${result.apiError}`);
    toast.error("API key error: Please check your Gemini API key", { duration: 8000 });
    dispatchImageGenerationErrorEvent(`API key error: ${result.apiError}`, prompt);
    activePolls.delete(requestId);
    return;
  }
  
  if (result.imageUrl) {
    console.log(`Valid image URL received for ${requestId}:`, result.imageUrl.substring(0, 50) + "...");
    await processImageUrl(result.imageUrl, prompt);
    activePolls.delete(requestId);
    return;
  }
  
  if (isProcessing(result.status)) {
    console.log(`Image still processing (${result.status}) for ${requestId}, polling again in ${delay}ms`);
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: retries - 1, 
      delay: calculateNextDelay(delay),
      maxRetries: params.maxRetries
    });
    return;
  }
  
  if (result.status === "completed" && !result.imageUrl) {
    console.log(`Completed status received for ${requestId} but no valid image URL, using fallback`);
    useFallbackImage(prompt, aspectRatio);
    activePolls.delete(requestId);
    return;
  }
  
  if (result.data) {
    console.log(`Unexpected status: ${result.status || "undefined"} for ${requestId}, but received data. Continuing polling.`);
    
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: Math.min(retries - 1, 3),
      delay, 
      maxRetries: params.maxRetries
    });
    return;
  }
  
  if (retries > 1) {
    console.log(`Status: ${result.status || "unknown"} for ${requestId}, continuing polling`);
    scheduleNextPoll({
      requestId, prompt, aspectRatio, style,
      retries: retries - 1, 
      delay, 
      maxRetries: params.maxRetries
    });
  } else {
    console.log(`No retries left for ${requestId}, using fallback`);
    useFallbackImage(prompt, aspectRatio);
    activePolls.delete(requestId);
  }
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string, requestId: string): void {
  console.error(`Error from API for ${requestId}:`, error);
  toast.error(`Image generation API error: ${typeof error === 'string' ? error : 'Unknown error'}`);
  
  useFallbackImage(prompt, aspectRatio);
  
  activePolls.delete(requestId);
}

/**
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  setTimeout(() => pollForImageResult(params), 50);
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.error(`Error in polling for ${params.requestId}:`, error);
  
  const shorterDelay = Math.max(1000, params.delay / 2);
  
  if (params.retries <= 2) {
    console.log(`Too many polling errors for ${params.requestId}, using fallback image`);
    handleMaxRetriesReached(params.prompt, params.aspectRatio, params.requestId);
    return;
  }
  
  setTimeout(() => pollForImageResult({
    ...params,
    retries: params.retries - 1,
    delay: shorterDelay
  }), shorterDelay);
}

/**
 * Cancels all active polling operations
 * Useful when changing tabs or starting a new generation
 */
export function cancelAllActivePolls(): void {
  console.log(`Canceling ${activePolls.size} active polls`);
  activePolls.clear();
}
