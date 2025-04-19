import { toast } from 'sonner';
import { dispatchImageGeneratedEvent } from './imageEvents';

/**
 * Gets a fallback image from Unsplash when generation fails
 */
export const getFallbackImage = async (
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> => {
  try {
    // Extract keywords from the prompt
    const keywords = prompt
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(',');
    
    // Determine width and height based on aspect ratio
    let width = 800;
    let height = 800;
    
    if (aspectRatio === "9:16" || aspectRatio === "3:4") {
      width = 600;
      height = 900;
    } else if (aspectRatio === "16:9" || aspectRatio === "4:3") {
      width = 900;
      height = 600;
    }
    
    // Add a random query param to avoid caching
    const randomParam = Math.random().toString(36).substring(7);
    
    // Use Unsplash source for a fallback image
    const fallbackUrl = `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(keywords || 'abstract')}&random=${randomParam}`;
    
    console.log("Using fallback image from Unsplash with keywords:", keywords);
    return fallbackUrl;
  } catch (error) {
    console.error("Error getting fallback image:", error);
    // Return a static image URL as a last resort
    return "https://placehold.co/800x800/333/white?text=Image+Generation+Failed";
  }
};

/**
 * Generates a fallback image using the getFallbackImage method
 */
export const generateFallbackImage = async (
  prompt: string, 
  imageSize: string = "800x800"
): Promise<void> => {
  try {
    const fallbackUrl = await getFallbackImage(prompt);
    toast.info("Using alternative image source", { id: "fallback-image" });
    dispatchImageGeneratedEvent(fallbackUrl, prompt);
  } catch (error) {
    console.error("Error generating fallback image:", error);
    const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
    dispatchImageGeneratedEvent(emergencyFallback, prompt);
  }
};
