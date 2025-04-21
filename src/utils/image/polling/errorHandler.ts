
import { toast } from "sonner";
import { PollImageParams } from "./types";
import { useFallbackImage } from "./fallbackHandler";
import { removeActivePoll } from "./pollingState";
import { dispatchImageGenerationErrorEvent } from '../imageEvents';

export const handleMaxRetriesReached = (prompt: string, aspectRatio: string, requestId: string): void => {
  console.log(`Maximum polling retries reached for request ${requestId}`);
  toast.error("Image generation timed out", { id: "generation-timeout" });
  
  removeActivePoll(requestId);
  useFallbackImage(prompt, aspectRatio);
};

export const handleApiError = (error: any, prompt: string, aspectRatio: string, requestId: string): void => {
  console.error(`Error from API for ${requestId}:`, error);
  toast.error(`Image generation API error: ${typeof error === 'string' ? error : 'Unknown error'}`);
  
  useFallbackImage(prompt, aspectRatio);
  removeActivePoll(requestId);
};

export const handlePollingError = async (error: any, params: PollImageParams): Promise<boolean> => {
  const { prompt, aspectRatio, requestId, retries } = params;
  console.error(`Error in polling for ${requestId}:`, error);
  
  if (retries <= 2) {
    console.log(`Too many polling errors for ${requestId}, using fallback image`);
    handleMaxRetriesReached(prompt, aspectRatio, requestId);
    return false;
  }

  return true;
};

export const handleApiKeyError = (error: string, requestId: string, prompt: string): void => {
  console.error(`Critical API error: ${error}`);
  toast.error("API key error: Please check your Gemini API key", { duration: 8000 });
  dispatchImageGenerationErrorEvent(`API key error: ${error}`, prompt);
  removeActivePoll(requestId);
};
