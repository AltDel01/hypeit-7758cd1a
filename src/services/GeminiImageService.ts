
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
      
      const toastId = toast.loading("Generating image with DALL-E...", { duration: 60000 });
      
      // Add a timestamp to help identify this specific request in logs
      const requestId = new Date().toISOString();
      console.log(`[${requestId}] Starting image generation request with OpenAI`);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          aspect_ratio: aspectRatio,
          style,
          request_id: requestId
        }
      });
      
      if (error) {
        console.error(`[${requestId}] Error invoking generate-image function:`, error);
        toast.error(`Failed to generate image: ${error.message}`, { id: toastId });
        return null;
      }
      
      if (data.error) {
        console.error(`[${requestId}] API returned error:`, data.error);
        toast.error(`Failed to generate image: ${data.error}`, { id: toastId });
        return null;
      }
      
      if (!data.imageUrl) {
        console.error(`[${requestId}] No image URL returned:`, data);
        toast.error("Failed to generate image: No image URL returned", { id: toastId });
        return null;
      }
      
      console.log(`[${requestId}] Image generated successfully`);
      toast.success("Image generated successfully!", { id: toastId });
      
      // If we received a revised prompt from OpenAI, log it
      if (data.revised_prompt) {
        console.log(`[${requestId}] OpenAI revised prompt: ${data.revised_prompt}`);
      }
      
      // Check if the image URL is a base64 image
      if (data.imageUrl.startsWith('data:')) {
        console.log(`[${requestId}] Generated image is a base64 image (likely a placeholder)`);
      } else {
        console.log(`[${requestId}] Generated image is a URL from OpenAI`);
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  // This method always returns true now, effectively bypassing the check
  static async checkApiKeyStatus(): Promise<boolean> {
    return true;
  }
}

export default GeminiImageService;
