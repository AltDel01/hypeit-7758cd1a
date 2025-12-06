
import { PollImageParams, ImageStatusResult } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { processImageUrl } from "./imageProcessor";
import { useFallbackImage } from "./fallbackHandler";
import { dispatchImageGenerationErrorEvent } from '../imageEvents';
import { POLLING_CONFIG, calculateNextDelay, isValidResponse, isProcessing } from './pollingUtils';

const activePolls = new Map<string, boolean>();

export async function pollForImageResult(params: PollImageParams): Promise<void> {
  const { 
    requestId, 
    prompt, 
    aspectRatio, 
    delay = POLLING_CONFIG.INITIAL_DELAY, 
    maxRetries = POLLING_CONFIG.MAX_RETRIES 
  } = params;
  
  if (!requestId || activePolls.has(requestId)) {
    return;
  }
  
  activePolls.set(requestId, true);
  let attempt = 0;
  let currentDelay = delay;
  
  while (attempt < maxRetries) {
    try {
      const result = await checkImageStatus(requestId);
      const handled = await handleStatusCheckResult(result, params);
      if (handled) {
        activePolls.delete(requestId);
        return;
      }
    } catch (error) {
      handleApiError(error, prompt, aspectRatio, requestId);
      break;
    }
    
    attempt += 1;
    await delayExecution(currentDelay);
    currentDelay = calculateNextDelay(currentDelay);
  }
  
  await handleMaxRetriesReached(prompt, aspectRatio, requestId);
}

/**
 * Handles the case when maximum retries are reached
 */
async function handleMaxRetriesReached(prompt: string, aspectRatio: string, requestId: string): Promise<void> {
  console.log(`Maximum polling retries reached for request ${requestId}`);
  activePolls.delete(requestId);
  await useFallbackImage(prompt, aspectRatio);
}

/**
 * Processes the result of a status check
 */
export async function handleStatusCheckResult(
  result: ImageStatusResult, 
  params: PollImageParams
): Promise<boolean> {
  const { prompt, aspectRatio, requestId } = params;
  
  if (result.error || result.apiError) {
    dispatchImageGenerationErrorEvent(result.error || result.apiError || "Unknown error", prompt, requestId);
    return true;
  }
  
  if (result.status && isValidResponse(result.status, result.imageUrl)) {
    await processImageUrl(result.imageUrl as string, prompt);
    return true;
  }
  
  if (!isProcessing(result.status)) {
    await useFallbackImage(prompt, aspectRatio);
    return true;
  }
  
  return false;
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string, requestId: string): void {
  console.error(`Error from API for ${requestId}:`, error);
  dispatchImageGenerationErrorEvent(error instanceof Error ? error.message : String(error), prompt, requestId);
  activePolls.delete(requestId);
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.error(`Error in polling for ${params.requestId}:`, error);
  dispatchImageGenerationErrorEvent(error instanceof Error ? error.message : String(error), params.prompt, params.requestId);
}

/**
 * Cancels all active polling operations
 * Useful when changing tabs or starting a new generation
 */
export function cancelAllActivePolls(): void {
  console.log(`Canceling ${activePolls.size} active polls`);
  activePolls.clear();
}
