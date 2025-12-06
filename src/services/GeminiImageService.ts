
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  dispatchImageGeneratedEvent,
  dispatchImageGenerationErrorEvent
} from "@/utils/image";
import { pollForImageResult } from "@/utils/image/imagePolling";
import { GenerateImageParams, ImageGenerationResponse } from "@/types/imageService";

export class GeminiImageService {
  /**
   * Generates an image based on the provided parameters
   * 
   * @param params - The image generation parameters
   * @returns A promise that resolves to the image URL or null
   */
  static async generateImage({ prompt, aspectRatio = "1:1", style, productImage, requestId }: GenerateImageParams): Promise<string | null> {
    try {
      console.log(`Generating image with prompt: "${prompt}", aspect ratio: ${aspectRatio}, style: ${style || 'default'}, product image: ${productImage ? 'provided' : 'none'}`);
      
      toast.info("Generating image with Gemini 2.0 Flash...", { duration: 5000, id: "generating-image" });
      
      // Create request body
      const requestBody: any = {
        prompt,
        aspect_ratio: aspectRatio,
        style
      };
      
      // If productImage is provided, convert it to base64 for sending to the service
      if (productImage) {
        console.log("Processing product image...");
        try {
          const imageBase64 = await this.fileToBase64(productImage);
          requestBody.product_image = imageBase64;
          
          console.log("Product image processed successfully");
        } catch (imageError) {
          console.error("Error processing product image:", imageError);
          toast.warning("Could not process product image, continuing without it");
          // Continue with generation even if image processing fails
        }
      }
      
      // Call the Supabase edge function
      console.log("Calling gemini-image-generate function with request body");
      const { data, error } = await supabase.functions.invoke("gemini-image-generate", {
        body: requestBody
      });
      
      // Handle Supabase function error
      if (error) {
        console.error("Error calling gemini-image-generate function:", error);
        const errorMessage = `Failed to generate image: ${error.message || "Unknown error"}`;
        dispatchImageGenerationErrorEvent(errorMessage, prompt, requestId);
        return null;
      }
      
      // Handle missing data response
      if (!data) {
        console.error("No data returned from gemini-image-generate function");
        dispatchImageGenerationErrorEvent("No data returned from service", prompt, requestId);
        return null;
      }
      
      console.log("Response from gemini-image-generate function:", data);
      
      // Parse the response
      const response = data as ImageGenerationResponse;
      
      // If we got a direct image URL (immediate success)
      if (response.imageUrl && response.status === "completed") {
        const isBase64 = response.imageUrl.startsWith('data:image/');
        const usedFallback = (response as any).usedFallback === true;
        
        console.log("Image generated successfully:", response.imageUrl.substring(0, 50) + "...");
        console.log("Source:", isBase64 ? "Gemini API" : usedFallback ? "Fallback (Unsplash)" : "Unknown");
        
        if (usedFallback) {
          console.warn("Note: Using fallback image due to:", (response as any).originalError || "API unavailable");
          toast.success("Image generated (using fallback source)");
        } else {
          toast.success("Image generated with Gemini 2.0 Flash!");
        }
        
        // Dispatch event with the image
        dispatchImageGeneratedEvent(response.imageUrl, prompt, undefined, requestId);
        
        return response.imageUrl;
      }
      
      // If we need to poll for the result
      if (response.requestId) {
        console.log(`Need to poll for image result, requestId: ${response.requestId}`);
        
        // Start polling for the result
        pollForImageResult({
          requestId: response.requestId,
          prompt,
          aspectRatio,
          style,
          retries: 20,
          delay: 2000,
          maxRetries: 20,
          originalRequestId: requestId // Pass the original request ID
        });
        
        // Return null since we'll get the result asynchronously via the event system
        return null;
      }
      
      // Handle error case
      if (response.error) {
        console.error("Error from gemini-image-generate function:", response.error);
        dispatchImageGenerationErrorEvent(response.error, prompt, requestId);
        return null;
      }
      
      console.error("Unexpected response format:", response);
      dispatchImageGenerationErrorEvent("Received unexpected response from the image generation service", prompt, requestId);
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage = `Error generating image: ${error instanceof Error ? error.message : String(error)}`;
      dispatchImageGenerationErrorEvent(errorMessage, prompt, requestId);
      return null;
    }
  }
  
  /**
   * Converts a file to a base64 string
   * 
   * @param file - The file to convert
   * @returns A promise that resolves to the base64 string
   */
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
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
