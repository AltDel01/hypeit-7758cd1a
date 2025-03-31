
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
      toast.success("Image generation completed!");
      
      // Dispatch a custom event to update UI components with the new image
      const event = new CustomEvent('imageGenerated', { detail: { imageUrl: data.imageUrl, prompt } });
      window.dispatchEvent(event);
      return;
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
    // Continue polling despite error
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
 * Dispatches an event with image data
 * 
 * @param imageUrl - The URL of the generated image
 * @param prompt - The prompt used to generate the image
 */
export function dispatchImageGeneratedEvent(imageUrl: string, prompt: string): void {
  const event = new CustomEvent('imageGenerated', { 
    detail: { imageUrl, prompt } 
  });
  window.dispatchEvent(event);
}
