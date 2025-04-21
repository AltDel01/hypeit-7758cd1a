
import { ImageStatusResult, PollImageParams } from "./types";
import { processImageUrl } from "./imageProcessor";
import { useFallbackImage } from "./fallbackHandler";
import { removeActivePoll } from "./pollingState";
import { isProcessing, calculateNextDelay } from './pollingUtils';

export const handleStatusCheckResult = async (
  result: ImageStatusResult,
  params: PollImageParams
): Promise<boolean> => {
  const { requestId, prompt, aspectRatio } = params;

  if (result.error) {
    console.error(`Error in polling result for ${requestId}:`, result.error);
    throw result.error;
  }

  if (result.apiError?.includes("API key")) {
    throw new Error(`API key error: ${result.apiError}`);
  }

  if (result.imageUrl) {
    console.log(`Valid image URL received for ${requestId}:`, result.imageUrl.substring(0, 50) + "...");
    await processImageUrl(result.imageUrl, prompt);
    removeActivePoll(requestId);
    return false;
  }

  if (isProcessing(result.status)) {
    console.log(`Image still processing (${result.status}) for ${requestId}, polling again`);
    return true;
  }

  if (result.status === "completed" && !result.imageUrl) {
    console.log(`Completed status received for ${requestId} but no valid image URL, using fallback`);
    useFallbackImage(prompt, aspectRatio);
    removeActivePoll(requestId);
    return false;
  }

  if (result.data) {
    return true;
  }

  if (params.retries > 1) {
    return true;
  }

  console.log(`No retries left for ${requestId}, using fallback`);
  useFallbackImage(prompt, aspectRatio);
  removeActivePoll(requestId);
  return false;
};
