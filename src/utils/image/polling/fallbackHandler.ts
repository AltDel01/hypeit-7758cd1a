
import { toast } from "sonner";
import { generateFallbackImage } from '../imageFallback';
import { dispatchImageGeneratedEvent } from '../imageEvents';

/**
 * Uses a fallback image when the primary generation fails
 */
export async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  // Show toast only once
  toast.info("Using alternative image source", { id: "fallback-image" });
  
  try {
    console.log(`Using fallback image for prompt: "${prompt}", aspect ratio: ${aspectRatio}`);
    
    // Generate a more tailored fallback based on aspect ratio
    const imageSize = aspectRatio === "9:16" ? "800x1400" : "800x800";
    
    // First attempt: Try to generate a targeted image with encoded prompt
    const searchTerms = prompt.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(',');
    
    // Add a timestamp to prevent caching
    const timestamp = Date.now();
    const fallbackUrl = `https://source.unsplash.com/featured/${imageSize}/?${encodeURIComponent(searchTerms || 'product')}&t=${timestamp}`;
    
    // Dispatch the event with the fallback URL
    dispatchImageGeneratedEvent(fallbackUrl, prompt);
  } catch (error) {
    handleFallbackError(error, prompt);
  }
}

/**
 * Handles errors during fallback image generation
 */
export function handleFallbackError(error: any, prompt: string): void {
  console.error("Error generating fallback image:", error);
  
  // Ultimate fallback - use a fixed image URL if all else fails
  const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
  dispatchImageGeneratedEvent(emergencyFallback, prompt);
}
