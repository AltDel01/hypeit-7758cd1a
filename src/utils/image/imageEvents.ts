
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
  };
}

/**
 * Dispatches an image generated event
 * @param imageUrl The URL of the generated image
 * @param prompt The prompt used to generate the image
 * @param error Optional error message if generation failed
 */
export const dispatchImageGeneratedEvent = (
  imageUrl: string, 
  prompt?: string,
  error?: string
): void => {
  // Log the event details
  console.log("Dispatching image generated event:", { 
    imageUrl: imageUrl?.substring(0, 50) + "...", 
    prompt, 
    error 
  });

  try {
    // Create and dispatch the custom event
    const event = new CustomEvent('imageGenerated', {
      detail: {
        imageUrl,
        prompt,
        success: !error,
        error,
        timestamp: Date.now()
      }
    });

    window.dispatchEvent(event);
    console.log("Image generated event dispatched successfully");
  } catch (dispatchError) {
    console.error("Error dispatching image generated event:", dispatchError);
  }
};

/**
 * Dispatches an image generation error event
 * @param error The error message
 * @param prompt The prompt that was used
 */
export const dispatchImageGenerationErrorEvent = (error: string, prompt?: string): void => {
  console.error("Image generation error:", error);
  
  // Show toast notification for the error
  toast.error(`Image generation failed: ${error}`, { duration: 5000 });
  
  // Use a fallback image URL
  const fallbackUrl = prompt 
    ? `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(','))}`
    : `https://source.unsplash.com/featured/800x800/?product`;
  
  // Dispatch the event with error details
  dispatchImageGeneratedEvent(fallbackUrl, prompt, error);
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
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener('imageGenerated', eventListener);
  };
};

