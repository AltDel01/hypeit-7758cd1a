
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  pollForImageResult, 
  dispatchImageGeneratedEvent 
} from "@/utils/image";
import { GenerateImageParams, ImageGenerationResponse } from "@/types/imageService";

export class GeminiImageService {
  /**
   * Generates an image based on the provided parameters
   * 
   * @param params - The image generation parameters
   * @returns A promise that resolves to the image URL or null
   */
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
      
      // Parse the response
      const response = data as ImageGenerationResponse;
      
      // If we got an accepted status with a requestId, start polling
      if (response.status === "accepted" && response.requestId) {
        toast.success("Image generation request accepted!");
        
        // Return the placeholder image URL for immediate display
        const placeholderUrl = response.imageUrl || "https://via.placeholder.com/600x600?text=Generating+Image...";
        
        // Start polling in the background
        this.startPolling(response.requestId, prompt, aspectRatio, style);
        
        // Immediately dispatch an event with the placeholder image
        dispatchImageGeneratedEvent(placeholderUrl, prompt);
        
        return placeholderUrl;
      }
      
      // If we got a direct image URL
      if (response.imageUrl) {
        console.log("Image generated successfully:", response.imageUrl);
        toast.success("Image generated successfully!");
        
        // Dispatch event with the final image
        dispatchImageGeneratedEvent(response.imageUrl, prompt);
        
        return response.imageUrl;
      }
      
      // Handle error case
      if (response.error) {
        console.error("Error from generate-image function:", response.error);
        toast.error(`Failed to generate image: ${response.error}`);
        return null;
      }
      
      console.error("Unexpected response format:", response);
      toast.error("Received unexpected response from the image generation service");
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  /**
   * Starts the polling process for an image generation request
   * 
   * @param requestId - The ID of the image generation request
   * @param prompt - The prompt used to generate the image
   * @param aspectRatio - The aspect ratio of the generated image
   * @param style - The style of the generated image (optional)
   */
  private static startPolling(requestId: string, prompt: string, aspectRatio: string, style?: string): void {
    console.log(`Starting polling for generated image with requestId: ${requestId}`);
    
    pollForImageResult({
      requestId,
      prompt,
      aspectRatio,
      style
    });
  }
  
  /**
   * Checks the status of the API key
   * This method always returns true now, effectively bypassing the check
   * 
   * @returns A promise that resolves to true
   */
  static async checkApiKeyStatus(): Promise<boolean> {
    return true;
  }
}

export default GeminiImageService;
