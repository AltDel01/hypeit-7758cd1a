
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
    requestId?: string; // Added requestId property
  };
}

/**
 * Dispatches an image generated event
 * @param imageUrl The URL of the generated image
 * @param prompt The prompt used to generate the image
 * @param error Optional error message if generation failed
 * @param requestId Optional request ID associated with the image
 */
export const dispatchImageGeneratedEvent = (
  imageUrl: string, 
  prompt?: string,
  error?: string,
  requestId?: string
): void => {
  // Log the event details
  console.log("Dispatching image generated event:", { 
    imageUrl: imageUrl?.substring(0, 50) + "...", 
    prompt, 
    error,
    requestId,
    timestamp: Date.now()
  });

  try {
    // Create and dispatch the custom event
    const event = new CustomEvent('imageGenerated', {
      detail: {
        imageUrl,
        prompt,
        success: !error,
        error,
        requestId,
        timestamp: Date.now()
      }
    });

    window.dispatchEvent(event);
    console.log("Image generated event dispatched successfully");
    
    // Show success toast if no error
    if (!error) {
      toast.success("Image generated successfully!");
    }
  } catch (dispatchError) {
    console.error("Error dispatching image generated event:", dispatchError);
    toast.error("Error handling generated image");
  }
};

/**
 * Dispatches an image generation error event
 * @param error The error message
 * @param prompt The prompt that was used
 * @param requestId Optional request ID associated with the failed image
 */
export const dispatchImageGenerationErrorEvent = (error: string, prompt?: string, requestId?: string): void => {
  console.error("Image generation error:", error);
  
  // Show toast notification for the error
  toast.error(`Image generation failed: ${error}`, { duration: 5000 });
  
  // Use a fallback image URL with the prompt as context
  const fallbackUrl = prompt 
    ? `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(','))}`
    : `https://source.unsplash.com/featured/800x800/?product`;
  
  // Dispatch the event with error details
  dispatchImageGeneratedEvent(fallbackUrl, prompt, error, requestId);
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
  
  console.log("Added listener for imageGenerated events");
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener('imageGenerated', eventListener);
  };
};

/**
 * Force triggers a retry for image generation
 * @param prompt The prompt to use for generation
 * @param aspectRatio The aspect ratio to use
 * @param requestId Optional request ID to associate with the retry
 */
export const forceImageGenerationRetry = (prompt: string, aspectRatio: string = "1:1", requestId?: string): void => {
  console.log("Forcing image generation retry with prompt:", prompt);
  
  // Dispatch a placeholder image event first to show loading state
  const placeholderUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzIwMjAyMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3MDcwNzAiPlJldHJ5aW5nIEltYWdlIEdlbmVyYXRpb248L3RleHQ+PC9zdmc+";
  dispatchImageGeneratedEvent(placeholderUrl, prompt, "Retrying generation", requestId);
  
  // Delay the actual retry trigger to allow UI to update
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('retryImageGeneration', {
      detail: { prompt, aspectRatio, requestId, timestamp: Date.now() }
    }));
    
    toast.info("Retrying image generation...");
  }, 100);
};
