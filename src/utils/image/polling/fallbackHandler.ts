
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
    // Generate a more tailored fallback based on aspect ratio
    const imageSize = aspectRatio === "9:16" ? "800x1400" : "800x800";
    
    // Generate and dispatch the fallback image
    generateFallbackImage(prompt, imageSize);
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
