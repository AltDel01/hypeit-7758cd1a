
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
      
      const toastId = toast.loading("Generating image...", { duration: 30000 });
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          aspect_ratio: aspectRatio,
          style,
          api_key: "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA" // Always use the default key
        }
      });
      
      if (error) {
        console.error("Error invoking generate-image function:", error);
        toast.error(`Failed to generate image: ${error.message}`, { id: toastId });
        return null;
      }
      
      if (data.error) {
        console.error("API returned error:", data.error);
        toast.error(`Failed to generate image: ${data.error}`, { id: toastId });
        return null;
      }
      
      if (!data.imageUrl) {
        console.error("No image URL returned:", data);
        toast.error("Failed to generate image: No image URL returned", { id: toastId });
        return null;
      }
      
      console.log("Image generated successfully:", data.imageUrl);
      toast.success("Image generated successfully!", { id: toastId });
      
      // Check if the image URL is a base64 image
      if (data.imageUrl.startsWith('data:')) {
        console.log("Generated image is a base64 image");
      } else {
        console.log("Generated image is a URL");
      }
      
      // Log the first 100 characters of the image URL to help debug
      console.log("Image URL preview:", data.imageUrl.substring(0, 100) + "...");
      
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
