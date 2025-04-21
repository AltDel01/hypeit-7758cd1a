
import { PollImageParams } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { POLLING_CONFIG } from './pollingUtils';
import { handleMaxRetriesReached, handlePollingError, handleApiKeyError } from './errorHandler';
import { handleStatusCheckResult } from './resultHandler';
import { addActivePoll, isPollingActive } from './pollingState';

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
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    await delayExecution(params.delay);
    
    const result = await checkImageStatus(requestId);
    
    if (result.apiError?.includes("API key")) {
      handleApiKeyError(result.apiError, requestId, prompt);
      return;
    }
    
    const nextParams = await handleStatusCheckResult(result, {
      ...params,
      retries: currentRetries
    });
    
    if (nextParams) {
      // Schedule next poll with updated parameters
      setTimeout(() => pollForImageResult(nextParams), 50);
    }
  } catch (error) {
    const updatedParams = await handlePollingError(error, {
      ...params,
      retries: currentRetries
    });
    
    if (updatedParams) {
      setTimeout(() => pollForImageResult(updatedParams), 50);
    }
  }
}
