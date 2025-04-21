
import { PollImageParams } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { POLLING_CONFIG } from './pollingUtils';
import { handleMaxRetriesReached, handlePollingError, handleApiKeyError } from './errorHandler';
import { handleStatusCheckResult } from './resultHandler';
import { addActivePoll, isPollingActive, removeActivePoll } from './pollingState';

export async function pollForImageResult(params: PollImageParams): Promise<void> {
  const { 
    requestId, 
    prompt, 
    aspectRatio,
    retries = POLLING_CONFIG.MAX_RETRIES,
    maxRetries = POLLING_CONFIG.MAX_RETRIES 
  } = params;
  
  if (isPollingActive(requestId)) {
    console.log(`Already polling for requestId: ${requestId}`);
    return;
  }
  
  addActivePoll(requestId);
  const currentRetries = Math.min(retries, maxRetries);
  
  if (currentRetries <= 0) {
    handleMaxRetriesReached(prompt, aspectRatio, requestId);
    removeActivePoll(requestId);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    await delayExecution(params.delay);
    
    const result = await checkImageStatus(requestId);
    
    if (result.apiError?.includes("API key")) {
      handleApiKeyError(result.apiError, requestId, prompt);
      removeActivePoll(requestId);
      return;
    }
    
    const shouldContinuePolling = await handleStatusCheckResult(result, {
      ...params,
      retries: currentRetries
    });
    
    if (shouldContinuePolling) {
      // Schedule next poll with updated parameters
      setTimeout(() => pollForImageResult({
        ...params,
        retries: currentRetries - 1
      }), 50);
    }
  } catch (error) {
    const shouldRetry = await handlePollingError(error, {
      ...params,
      retries: currentRetries
    });
    
    if (shouldRetry) {
      setTimeout(() => pollForImageResult({
        ...params,
        retries: currentRetries - 1,
        delay: Math.max(1000, params.delay / 2)
      }), 50);
    } else {
      removeActivePoll(requestId);
    }
  }
}
