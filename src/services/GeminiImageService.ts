
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
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
  static async generateImage({ prompt, aspectRatio = "1:1", style, productImage }: GenerateImageParams): Promise<string | null> {
    try {
      console.log(`Generating image with prompt: "${prompt}", aspect ratio: ${aspectRatio}, style: ${style || 'default'}, product image: ${productImage ? 'provided' : 'none'}`);
      
      toast.info("Generating image with Gemini 2.0 Flash...", { duration: 5000 });
      
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
          requestBody.product_image_name = productImage.name;
          requestBody.product_image_type = productImage.type;
          
          console.log("Product image processed successfully");
        } catch (imageError) {
          console.error("Error processing product image:", imageError);
          // Continue with generation even if image processing fails
        }
      }
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("gemini-image-generate", {
        body: requestBody
      });
      
      if (error) {
        console.error("Error calling gemini-image-generate function:", error);
        toast.error(`Failed to generate image: ${error.message}`);
        return null;
      }
      
      if (!data) {
        console.error("No data returned from gemini-image-generate function");
        toast.error("Failed to generate image: No data returned");
        return null;
      }
      
      console.log("Response from gemini-image-generate function:", data);
      
      // Parse the response
      const response = data as ImageGenerationResponse;
      
      // If we got an image URL
      if (response.imageUrl) {
        console.log("Image generated successfully:", response.imageUrl);
        toast.success("Image generated successfully!");
        
        // Dispatch event with the image
        dispatchImageGeneratedEvent(response.imageUrl, prompt);
        
        return response.imageUrl;
      }
      
      // Handle error case
      if (response.error) {
        console.error("Error from gemini-image-generate function:", response.error);
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
          // Extract the base64 part from the Data URL
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
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
