
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
  
  // Immediately return without doing anything - image generation disabled
  console.log("Image generation is currently disabled");
  return;
}

/**
 * Handles the case when maximum retries are reached
 */
function handleMaxRetriesReached(prompt: string, aspectRatio: string, requestId: string): void {
  console.log(`Maximum polling retries reached for request ${requestId}`);
  activePolls.delete(requestId);
  // Image generation fallback disabled
}

/**
 * Processes the result of a status check
 */
export async function handleStatusCheckResult(
  result: ImageStatusResult, 
  params: PollImageParams
): Promise<void> {
  // Image generation is disabled, do nothing
  return;
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string, requestId: string): void {
  console.error(`Error from API for ${requestId}:`, error);
  activePolls.delete(requestId);
}

/**
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  // Image generation polling disabled
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.error(`Error in polling for ${params.requestId}:`, error);
}

/**
 * Cancels all active polling operations
 * Useful when changing tabs or starting a new generation
 */
export function cancelAllActivePolls(): void {
  console.log(`Canceling ${activePolls.size} active polls`);
  activePolls.clear();
}
