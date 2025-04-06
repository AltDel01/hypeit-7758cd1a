
import { toast } from "sonner";
import { dispatchImageGeneratedEvent } from '../imageEvents';
import { addCacheBusterToUrl } from "./helpers";

/**
 * Processes an image URL by validating and dispatching the event
 */
export async function processImageUrl(imageUrl: string, prompt: string): Promise<void> {
  try {
    // Always add a cache buster to prevent caching issues
    const finalUrl = addCacheBusterToUrl(imageUrl);
    console.log(`Processing image URL: ${finalUrl}`);
    
    // Show success toast
    toast.success("Image generated successfully!");
    
    // Dispatch event with the final URL
    dispatchImageGeneratedEvent(finalUrl, prompt);
    
  } catch (error) {
    console.error("Error processing image URL:", error);
    throw error;
  }
}
