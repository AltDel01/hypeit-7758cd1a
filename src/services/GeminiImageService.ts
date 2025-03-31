
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: "1:1" | "9:16";
  style?: string;
}

export class GeminiImageService {
  static async generateImage({ prompt, aspectRatio = "1:1", style }: GenerateImageParams): Promise<string | null> {
    try {
      console.log(`Generating image with prompt: "${prompt}", aspect ratio: ${aspectRatio}, style: ${style || 'default'}`);
      
      toast.info("Generating image...", { duration: 5000 });
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt,
          aspect_ratio: aspectRatio,
          style
        }
      });
      
      if (error) {
        console.error("Error calling generate-image function:", error);
        toast.error(`Failed to generate image: ${error.message}`);
        return null;
      }
      
      if (!data) {
        console.error("No data returned from generate-image function");
        toast.error("Failed to generate image: No data returned");
        return null;
      }
      
      console.log("Initial response from generate-image function:", data);
      
      // If we got an accepted status with a requestId, start polling
      if (data.status === "accepted" && data.requestId) {
        toast.success("Image generation request accepted!");
        
        // Return the placeholder image URL for immediate display
        const placeholderUrl = data.imageUrl || "https://via.placeholder.com/600x600?text=Generating+Image...";
        
        // Start polling in the background
        this.pollForImageResult(data.requestId, prompt, aspectRatio, style);
        
        return placeholderUrl;
      }
      
      // If we got a direct image URL
      if (data.imageUrl) {
        console.log("Image generated successfully:", data.imageUrl);
        toast.success("Image generated successfully!");
        return data.imageUrl;
      }
      
      // Handle error case
      if (data.error) {
        console.error("Error from generate-image function:", data.error);
        toast.error(`Failed to generate image: ${data.error}`);
        return null;
      }
      
      console.error("Unexpected response format:", data);
      toast.error("Received unexpected response from the image generation service");
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  static async pollForImageResult(requestId: string, prompt: string, aspectRatio: string, style?: string, retries = 10, delay = 3000): Promise<void> {
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
        setTimeout(() => this.pollForImageResult(requestId, prompt, aspectRatio, style, retries - 1, delay), delay);
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
        setTimeout(() => this.pollForImageResult(requestId, prompt, aspectRatio, style, retries - 1, delay), delay);
        return;
      }
      
      // If we got an error, stop polling
      if (data && data.error) {
        console.error("Error from poll:", data.error);
        toast.error(`Image generation failed: ${data.error}`);
        return;
      }
      
      // If we don't know the status, continue polling with a shorter retry count
      setTimeout(() => this.pollForImageResult(requestId, prompt, aspectRatio, style, retries - 1, delay), delay);
    } catch (error) {
      console.error("Error in polling:", error);
      // Continue polling despite error
      setTimeout(() => this.pollForImageResult(requestId, prompt, aspectRatio, style, retries - 1, delay), delay);
    }
  }
  
  // This method always returns true now, effectively bypassing the check
  static async checkApiKeyStatus(): Promise<boolean> {
    return true;
  }
}

export default GeminiImageService;
