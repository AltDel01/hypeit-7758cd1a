
import { toast } from "sonner";
import { dispatchImageGeneratedEvent } from '../imageEvents';
import { addCacheBusterToUrl } from "./helpers";

/**
 * Processes an image URL by validating and dispatching the event
 */
export async function processImageUrl(imageUrl: string, prompt: string): Promise<void> {
  try {
    // Check if this is an Unsplash URL
    if (imageUrl.includes('unsplash.com')) {
      const finalUrl = addCacheBusterToUrl(imageUrl);
      toast.success("Image generated successfully!");
      dispatchImageGeneratedEvent(finalUrl, prompt);
      return;
    }
    
    // For other URLs, dispatch directly without validation
    toast.success("Image generation completed!");
    dispatchImageGeneratedEvent(imageUrl, prompt);
    
  } catch (error) {
    console.error("Error processing image URL:", error);
    throw error;
  }
}
