
/**
 * Utilities for handling image-related events
 * NOTE: Image generation functionality is currently disabled
 */

import { toast } from "sonner";

/**
 * Interface for image generated event details
 */
interface ImageGeneratedEvent extends CustomEvent {
  detail: {
    imageUrl: string;
    prompt?: string;
    success: boolean;
    error?: string;
    timestamp?: number;
    requestId?: string;
  };
}

/**
 * Dispatches an image generated event
 * Currently disabled as image generation is not available
 */
export const dispatchImageGeneratedEvent = (
  imageUrl: string, 
  prompt?: string,
  error?: string,
  requestId?: string
): void => {
  console.log("Image generation is currently disabled");
  // No event will be dispatched
};

/**
 * Dispatches an image generation error event
 * Currently disabled as image generation is not available
 */
export const dispatchImageGenerationErrorEvent = (error: string, prompt?: string, requestId?: string): void => {
  console.log("Image generation is currently disabled");
  toast.info("Image generation is currently not available");
};

/**
 * Adds a listener for image generated events
 * @param callback The callback function to call when an image is generated
 * @returns A function to remove the event listener
 */
export const addImageGeneratedListener = (
  callback: (event: ImageGeneratedEvent) => void
): () => void => {
  const eventListener = (event: Event) => {
    callback(event as ImageGeneratedEvent);
  };

  window.addEventListener('imageGenerated', eventListener);
  
  console.log("Added listener for imageGenerated events (note: generation is disabled)");
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener('imageGenerated', eventListener);
  };
};

/**
 * Force triggers a retry for image generation
 * Currently disabled as image generation is not available
 */
export const forceImageGenerationRetry = (prompt: string, aspectRatio: string = "1:1", requestId?: string): void => {
  console.log("Image generation is currently disabled");
  toast.info("Image generation is currently not available");
};
