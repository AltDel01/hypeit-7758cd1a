
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateFallbackImage } from './imageFallback';
import { dispatchImageGeneratedEvent } from './imageEvents';

export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries?: number;
  delay?: number;
  maxRetries?: number;
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
  delay = 3000,
  maxRetries = 10
}: PollImageParams): Promise<void> {
  // Set maximum retries to prevent infinite polling
  const currentRetries = Math.min(retries, maxRetries);
  
  if (currentRetries <= 0) {
    console.log("Maximum polling retries reached");
    toast.error("Image generation is taking longer than expected");
    
    // Always provide a fallback image when maximum retries reached
    await useFallbackImage(prompt, aspectRatio);
    return;
  }
  
  try {
    console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Call the edge function with the requestId to check status
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: {
        requestId,
        checkOnly: true // Add a flag to indicate this is just a status check
      }
    });
    
    if (error) {
      console.error("Error polling for image status:", error);
      // Use a shorter retry interval when there are API errors
      setTimeout(() => pollForImageResult({
        requestId, prompt, aspectRatio, style, 
        retries: currentRetries - 1, 
        delay: Math.max(1000, delay / 2) // Reduce delay but not below 1 second
      }), Math.max(1000, delay / 2));
      return;
    }
    
    console.log("Poll response:", data);
    
    // If we have an image URL, validate and use it
    if (data?.imageUrl && isValidImageUrl(data.imageUrl)) {
      await processImageUrl(data.imageUrl, prompt);
      return;
    }
    
    // Handle different status responses
    if (data?.status === "processing" || data?.status === "accepted") {
      // Continue polling with reduced retry count
      setTimeout(() => pollForImageResult({
        requestId, 
        prompt, 
        aspectRatio, 
        style, 
        retries: currentRetries - 1, 
        delay
      }), delay);
      return;
    }
    
    // If we got an error from the API
    if (data?.error) {
      console.error("Error from poll:", data.error);
      toast.error(`Image generation failed: ${data.error}`);
      
      // Use fallback image source
      await useFallbackImage(prompt, aspectRatio);
      return;
    }
    
    // If we don't know the status, continue polling with a shorter retry count
    setTimeout(() => pollForImageResult({
      requestId, 
      prompt, 
      aspectRatio, 
      style, 
      retries: currentRetries - 1, 
      delay
    }), delay);
    
  } catch (error) {
    console.error("Error in polling:", error);
    // Use a shorter retry interval when there are exceptions
    setTimeout(() => pollForImageResult({
      requestId, 
      prompt, 
      aspectRatio, 
      style, 
      retries: currentRetries - 1, 
      delay: Math.max(1000, delay / 2)
    }), Math.max(1000, delay / 2));
  }
}

/**
 * Checks if an image URL is valid and not a placeholder
 * 
 * @param url - The URL to check
 * @returns True if the URL is valid and not a placeholder
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's not a placeholder image
  if (url.includes('placeholder.com') || url.includes('Generating+Image')) {
    return false;
  }
  
  return true;
}

/**
 * Processes an image URL by validating and dispatching the event
 * 
 * @param imageUrl - The URL of the generated image
 * @param prompt - The prompt used to generate the image
 */
async function processImageUrl(imageUrl: string, prompt: string): Promise<void> {
  try {
    // Check if this is an Unsplash URL
    if (imageUrl.includes('unsplash.com')) {
      // For Unsplash, add a cache-busting parameter and directly use it
      const cacheBuster = Date.now();
      const finalUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${cacheBuster}` 
        : `${imageUrl}?t=${cacheBuster}`;
      
      toast.success("Image generated successfully!");
      dispatchImageGeneratedEvent(finalUrl, prompt);
      return;
    }
    
    // For other URLs, dispatch directly without validation to avoid additional requests
    toast.success("Image generation completed!");
    dispatchImageGeneratedEvent(imageUrl, prompt);
    
  } catch (error) {
    console.error("Error processing image URL:", error);
    throw error;
  }
}

/**
 * Uses a fallback image when the primary generation fails
 * 
 * @param prompt - The prompt used to generate the image
 * @param aspectRatio - The aspect ratio of the image
 */
async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  // Show toast only once
  toast.info("Using alternative image source", { id: "fallback-image" });
  
  try {
    // Generate a more tailored fallback based on aspect ratio
    const imageSize = aspectRatio === "9:16" ? "800x1400" : "800x800";
    
    // Generate and dispatch the fallback image
    generateFallbackImage(prompt, imageSize);
  } catch (error) {
    console.error("Error generating fallback image:", error);
    
    // Ultimate fallback - use a fixed image URL if all else fails
    const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
    dispatchImageGeneratedEvent(emergencyFallback, prompt);
  }
}
