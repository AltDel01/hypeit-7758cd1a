import { checkImageStatus } from './statusChecker';
import { processImageUrl } from './imageProcessor';
import { generateFallbackImage } from '../imageFallback';
import type { PollImageParams } from './types';

// Maximum number of polling attempts before falling back
const MAX_POLLING_ATTEMPTS = 12;

// Delay between polling attempts in milliseconds
const POLLING_DELAY = 5000;

/**
 * Polls for image generation result
 */
export async function pollForImageResult({
  requestId,
  prompt,
  aspectRatio = "1:1",
  style,
  imageReference,
  mimeType
}: PollImageParams): Promise<void> {
  let attempts = 0;
  
  console.log(`Starting polling for request ${requestId} with prompt: "${prompt}"`);
  
  // Function to check status with retry logic
  const checkStatus = async () => {
    try {
      attempts++;
      console.log(`Polling attempt ${attempts} for request ${requestId}`);
      
      // Check image status
      const result = await checkImageStatus(requestId);
      
      // If we got a completed status with an image URL
      if (result.status === "completed" && result.imageUrl) {
        console.log(`Image generation completed for request ${requestId}`, result);
        await processImageUrl(result.imageUrl, prompt);
        return;
      }
      
      // If we got an error, log it and try again
      if (result.apiError || result.error) {
        console.error(`Error in poll attempt ${attempts}:`, result.apiError || result.error);
        
        // If we've tried too many times, generate a fallback image
        if (attempts >= MAX_POLLING_ATTEMPTS) {
          console.log(`Max polling attempts reached for request ${requestId}, generating fallback`);
          generateFallbackImage(prompt, aspectRatio.replace(':', 'x'));
          return;
        }
      }
      
      // If status is 'failed', generate a fallback
      if (result.status === "failed") {
        console.log(`Image generation failed for request ${requestId}, generating fallback`);
        generateFallbackImage(prompt, aspectRatio.replace(':', 'x'));
        return;
      }
      
      // Otherwise, try again after a delay
      if (attempts < MAX_POLLING_ATTEMPTS) {
        setTimeout(checkStatus, POLLING_DELAY);
      } else {
        console.log(`Max polling attempts reached for request ${requestId}, generating fallback`);
        generateFallbackImage(prompt, aspectRatio.replace(':', 'x'));
      }
    } catch (error) {
      console.error(`Error polling for image result:`, error);
      
      // If an exception occurs during polling, generate fallback after max attempts
      if (attempts >= MAX_POLLING_ATTEMPTS) {
        console.log(`Max polling attempts reached for request ${requestId}, generating fallback`);
        generateFallbackImage(prompt, aspectRatio.replace(':', 'x'));
      } else {
        setTimeout(checkStatus, POLLING_DELAY);
      }
    }
  };
  
  // Start checking status
  checkStatus();
}
