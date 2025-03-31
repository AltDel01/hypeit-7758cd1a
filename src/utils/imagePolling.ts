
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries?: number;
  delay?: number;
}

/**
 * Polls for the result of an image generation request
 * 
 * @param params - The polling parameters
 * @returns A promise that resolves when polling is complete
 */
export async function pollForImageResult({
  requestId,
  prompt,
  aspectRatio,
  style,
  retries = 10,
  delay = 3000
}: PollImageParams): Promise<void> {
  if (retries <= 0) {
    console.log("Maximum polling retries reached");
    toast.error("Image generation is taking longer than expected. Please try again later.");
    
    // Provide a more reliable fallback image
    generateFallbackImage(prompt);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${retries}`);
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Call the edge function with the requestId to check status
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: {
        requestId
      }
    });
    
    if (error) {
      console.error("Error polling for image status:", error);
      
      // Use fallback image more aggressively
      if (retries < 8) {
        generateFallbackImage(prompt);
        return;
      }
      
      // Continue polling despite error
      setTimeout(() => pollForImageResult({
        requestId, 
        prompt, 
        aspectRatio, 
        style, 
        retries: retries - 1, 
        delay
      }), delay);
      return;
    }
    
    console.log("Poll response:", data);
    
    // If we have an image URL, we're done
    if (data && data.imageUrl && data.imageUrl !== "https://via.placeholder.com/600x600?text=Generating+Image...") {
      console.log("Image ready:", data.imageUrl);
      
      // Add a validation check for the image URL
      try {
        // Check if this is an Unsplash URL
        if (data.imageUrl.includes('unsplash.com')) {
          // For Unsplash, add a cache-busting parameter and directly use it
          const cacheBuster = Date.now();
          const finalUrl = data.imageUrl.includes('?') 
            ? `${data.imageUrl}&t=${cacheBuster}` 
            : `${data.imageUrl}?t=${cacheBuster}`;
          
          toast.success("Image generated successfully!");
          dispatchImageGeneratedEvent(finalUrl, prompt);
          return;
        }
        
        // For other URLs, validate them first
        const imageCheck = await fetch(data.imageUrl, { method: 'HEAD' });
        if (imageCheck.ok) {
          toast.success("Image generation completed!");
          dispatchImageGeneratedEvent(data.imageUrl, prompt);
          return;
        } else {
          throw new Error("Image URL returned non-OK status");
        }
      } catch (imgError) {
        console.error("Image URL validation failed:", imgError);
        // If validation fails, use a fallback
        generateFallbackImage(prompt);
        return;
      }
    }
    
    // If it's still processing, continue polling
    if (data && (data.status === "processing" || data.status === "accepted")) {
      setTimeout(() => pollForImageResult({
        requestId, 
        prompt, 
        aspectRatio, 
        style, 
        retries: retries - 1, 
        delay
      }), delay);
      return;
    }
    
    // If we got an error, stop polling
    if (data && data.error) {
      console.error("Error from poll:", data.error);
      toast.error(`Image generation failed: ${data.error}`);
      
      // Use fallback image source
      generateFallbackImage(prompt);
      return;
    }
    
    // If we don't know the status, continue polling with a shorter retry count
    setTimeout(() => pollForImageResult({
      requestId, 
      prompt, 
      aspectRatio, 
      style, 
      retries: retries - 1, 
      delay
    }), delay);
  } catch (error) {
    console.error("Error in polling:", error);
    
    // Use fallback for critical errors
    if (retries < 6) {
      generateFallbackImage(prompt);
      return;
    }
    
    // Continue polling despite error with reduced retries
    setTimeout(() => pollForImageResult({
      requestId, 
      prompt, 
      aspectRatio, 
      style, 
      retries: retries - 1, 
      delay
    }), delay);
  }
}

/**
 * Generates a fallback image using Unsplash
 * 
 * @param prompt - The prompt to use for generating the fallback image
 */
function generateFallbackImage(prompt: string): void {
  // Extract key terms from the prompt for better image search
  const searchTerms = prompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .join(',');
  
  // Generate a cache-busting parameter
  const cacheBuster = Date.now();
  
  // Create a fallback Unsplash URL with search terms and dimensions
  let fallbackUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms || 'product')}`;
  
  // Add cache-busting parameter
  fallbackUrl = `${fallbackUrl}&t=${cacheBuster}`;
  
  console.log(`Using fallback image from Unsplash with search terms: ${searchTerms}`);
  toast.info("Using alternative image source");
  
  // Dispatch the event with the fallback image
  dispatchImageGeneratedEvent(fallbackUrl, prompt);
}

/**
 * Dispatches an event with image data
 * 
 * @param imageUrl - The URL of the generated image
 * @param prompt - The prompt used to generate the image
 */
export function dispatchImageGeneratedEvent(imageUrl: string, prompt: string): void {
  console.log(`Dispatching imageGenerated event with URL: ${imageUrl}`);
  
  // For unsplash URLs, add a timestamp to prevent caching
  const finalUrl = imageUrl.includes('unsplash.com') 
    ? `${imageUrl}&t=${Date.now()}` 
    : imageUrl;
    
  const event = new CustomEvent('imageGenerated', { 
    detail: { imageUrl: finalUrl, prompt } 
  });
  window.dispatchEvent(event);
}
