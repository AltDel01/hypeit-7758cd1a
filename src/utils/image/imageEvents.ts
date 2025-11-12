
/**
 * Utilities for handling image-related events
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
 * Dispatches an image generated event - DISABLED
 */
export const dispatchImageGeneratedEvent = (
  imageUrl: string, 
  prompt?: string,
  error?: string,
  requestId?: string
): void => {
  // Image generation event dispatching is disabled
  console.log("Image generation events are disabled");
};

/**
 * Dispatches an image generation error event - DISABLED
 */
export const dispatchImageGenerationErrorEvent = (error: string, prompt?: string, requestId?: string): void => {
  console.error("Image generation error:", error);
  // No action - image generation is disabled
};

/**
 * Adds a listener for image generated events
 */
export const addImageGeneratedListener = (
  callback: (event: ImageGeneratedEvent) => void
): () => void => {
  const eventListener = (event: Event) => {
    callback(event as ImageGeneratedEvent);
  };

  window.addEventListener('imageGenerated', eventListener);
  
  console.log("Added listener for imageGenerated events");
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener('imageGenerated', eventListener);
  };
};

/**
 * Force triggers a retry for image generation - DISABLED
 */
export const forceImageGenerationRetry = (prompt: string, aspectRatio: string = "1:1", requestId?: string): void => {
  console.log("Image generation retry requested, but feature is disabled");
  // No action - image generation is disabled
};
