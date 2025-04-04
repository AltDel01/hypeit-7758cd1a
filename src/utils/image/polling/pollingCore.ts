import { checkImageStatus } from './statusChecker';
import { processImageUrl } from './imageProcessor';
import { generateFallbackImage } from '../imageFallback';
import { useFallbackImage } from './fallbackHandler';
import { dispatchImageGeneratedEvent } from '../imageEvents';
import type { PollImageParams, ImageStatusResult } from './types';

// Maximum number of polling attempts before falling back
const MAX_POLLING_ATTEMPTS = 15;

// Delay between polling attempts in milliseconds
const POLLING_DELAY = 4000;

// Maximum time for polling in milliseconds
const MAX_POLLING_TIME = 90000; // 90 seconds

// Maximum time to wait once progress reaches 90%
const MAX_STALLED_TIME = 20000; // 20 seconds at 90+%

/**
 * Polls for image generation result
 */
export async function pollForImageResult({
  requestId,
  prompt,
  aspectRatio = "1:1",
  style,
  imageReference,
  mimeType,
  forceWebhook
}: PollImageParams): Promise<void> {
  let attempts = 0;
  const startTime = Date.now();
  let isWebhook = !!forceWebhook || !!imageReference;
  let highProgressStartTime: number | null = null;
  
  console.log(`Starting polling for request ${requestId} with prompt: "${prompt}"`);
  console.log(`Using webhook: ${isWebhook}, Reference image: ${!!imageReference}`);
  
  // Function to check status with retry logic
  const checkStatus = async () => {
    try {
      attempts++;
      console.log(`Polling attempt ${attempts} for request ${requestId}`);
      
      // Check if we've exceeded the maximum polling time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > MAX_POLLING_TIME) {
        console.warn(`Maximum polling time of ${MAX_POLLING_TIME}ms exceeded for request ${requestId}`);
        await useFallbackImage(prompt, aspectRatio.replace(':', 'x'));
        return;
      }
      
      // Check if we've been stuck at high progress for too long
      if (highProgressStartTime && (Date.now() - highProgressStartTime > MAX_STALLED_TIME)) {
        console.warn(`Request ${requestId} stalled at high progress for too long`);
        // Force completion with a placeholder to break the stall
        dispatchImageGeneratedEvent(
          `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(prompt)}&t=${Date.now()}`, 
          prompt
        );
        return;
      }
      
      // Check image status
      const result = await checkImageStatus(requestId, isWebhook, imageReference, mimeType);
      await handleStatusResult(result);
      
    } catch (error) {
      console.error(`Error polling for image result:`, error);
      
      // If an exception occurs during polling, generate fallback after max attempts
      if (attempts >= MAX_POLLING_ATTEMPTS) {
        console.log(`Max polling attempts reached for request ${requestId}, generating fallback`);
        await useFallbackImage(prompt, aspectRatio.replace(':', 'x'));
      } else {
        setTimeout(checkStatus, POLLING_DELAY);
      }
    }
  };
  
  // Helper function to process status results
  const handleStatusResult = async (result: ImageStatusResult) => {
    // If progress is reporting high, start tracking that time
    if (result.progress && result.progress >= 90 && !highProgressStartTime) {
      highProgressStartTime = Date.now();
      console.log(`Progress reached 90% for request ${requestId}, starting stall timer`);
    }
    
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
        await useFallbackImage(prompt, aspectRatio.replace(':', 'x'));
        return;
      }
    }
    
    // If status is 'failed', generate a fallback
    if (result.status === "failed") {
      console.log(`Image generation failed for request ${requestId}, generating fallback`);
      await useFallbackImage(prompt, aspectRatio.replace(':', 'x'));
      return;
    }
    
    // Otherwise, try again after a delay
    if (attempts < MAX_POLLING_ATTEMPTS) {
      setTimeout(checkStatus, POLLING_DELAY);
    } else {
      console.log(`Max polling attempts reached for request ${requestId}, generating fallback`);
      await useFallbackImage(prompt, aspectRatio.replace(':', 'x'));
    }
  };
  
  // Start checking status
  checkStatus();
}
