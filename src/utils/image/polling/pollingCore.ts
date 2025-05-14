
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
  // Image generation is disabled
  console.log("Image generation is currently disabled");
  
  // No polling or image generation will be performed
  return;
}

/**
 * Handles the case when maximum retries are reached
 */
function handleMaxRetriesReached(prompt: string, aspectRatio: string, requestId: string): void {
  console.log(`Maximum polling retries reached for request ${requestId}`);
  
  activePolls.delete(requestId);
}

/**
 * Processes the result of a status check
 */
export async function handleStatusCheckResult(
  result: ImageStatusResult, 
  params: PollImageParams
): Promise<void> {
  // Image generation is disabled, so this function is effectively disabled
  console.log("Image status check is disabled");
  return;
}

/**
 * Handles API errors during polling
 */
function handleApiError(error: any, prompt: string, aspectRatio: string, requestId: string): void {
  console.log("Image generation is disabled");
  activePolls.delete(requestId);
}

/**
 * Schedules the next polling attempt
 */
function scheduleNextPoll(params: PollImageParams): void {
  // Disabled - no polling will be scheduled
  return;
}

/**
 * Handles errors that occur during polling
 */
export function handlePollingError(error: any, params: PollImageParams): void {
  console.log("Image generation is disabled");
  return;
}

/**
 * Cancels all active polling operations
 * Useful when changing tabs or starting a new generation
 */
export function cancelAllActivePolls(): void {
  console.log(`Canceling ${activePolls.size} active polls`);
  activePolls.clear();
}
