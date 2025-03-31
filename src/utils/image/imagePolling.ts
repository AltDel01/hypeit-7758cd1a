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
        requestId
      }
    });
    
    if (error) {
      console.error("Error polling for image status:", error);
      handlePollingError(error, currentRetries, { requestId, prompt, aspectRatio, style, retries: currentRetries - 1, delay });
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
    handlePollingError(error, currentRetries, { requestId, prompt, aspectRatio, style, retries: currentRetries - 1, delay });
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
    
    // For other URLs, validate them first with a HEAD request
    try {
      const imageCheck = await fetch(imageUrl, { 
        method: 'HEAD',
        // Set a timeout to avoid waiting too long
        signal: AbortSignal.timeout(5000)
      });
          
      if (imageCheck.ok) {
        toast.success("Image generation completed!");
        dispatchImageGeneratedEvent(imageUrl, prompt);
        return;
      } else {
        throw new Error(`Image URL returned status: ${imageCheck.status}`);
      }
    } catch (imgError) {
      console.error("Image URL validation failed:", imgError);
      throw imgError; // Re-throw to be handled by the caller
    }
  } catch (error) {
    console.error("Error processing image URL:", error);
    // If validation fails, let the caller handle it
    throw error;
  }
}

/**
 * Handles errors during the polling process
 * 
 * @param error - The error that occurred
 * @param currentRetries - The current number of retries
 * @param pollParams - The polling parameters to continue with
 */
function handlePollingError(error: any, currentRetries: number, pollParams: PollImageParams): void {
  // For critical errors with fewer retries left, use fallback immediately
  if (currentRetries < 6) {
    useFallbackImage(pollParams.prompt, pollParams.aspectRatio);
    return;
  }
  
  // Otherwise, continue polling despite error with reduced retries
  setTimeout(() => pollForImageResult(pollParams), pollParams.delay);
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
    
    // Use search terms from prompt for better results
    const searchTerms = extractSearchTerms(prompt);
    
    console.log(`Using fallback image with search terms: ${searchTerms}, size: ${imageSize}`);
    
    // Generate and dispatch the fallback image
    generateFallbackImage(prompt, imageSize);
  } catch (error) {
    console.error("Error generating fallback image:", error);
    
    // Ultimate fallback - use a fixed image URL if all else fails
    const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
    dispatchImageGeneratedEvent(emergencyFallback, prompt);
  }
}

/**
 * Extracts relevant search terms from a prompt
 * 
 * @param prompt - The prompt to extract terms from
 * @returns A string of comma-separated search terms
 */
function extractSearchTerms(prompt: string): string {
  // Clean up the prompt
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  // Extract key terms (words longer than 3 characters)
  const terms = cleanPrompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
    
  // If no terms were extracted, use a default
  return terms || 'product,skincare';
}
