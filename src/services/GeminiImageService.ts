
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
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          aspect_ratio: aspectRatio,
          style
        }
      });
      
      if (error) {
        console.error("Error invoking generate-image function:", error);
        toast.error(`Failed to generate image: ${error.message}`);
        return null;
      }
      
      if (data.error) {
        console.error("API returned error:", data.error);
        toast.error(`Failed to generate image: ${data.error}`);
        return null;
      }
      
      console.log("Image generated successfully");
      toast.success("Image generated successfully!");
      
      return data.imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  static async checkApiKeyStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-gemini-key', {
        body: { action: 'check' }
      });
      
      if (error || !data.success) {
        // If the default key was provided directly, try to set it automatically
        if (!error && data?.message === 'API key is not configured') {
          try {
            // Try to apply default key
            const defaultKey = "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA";
            const result = await supabase.functions.invoke('test-gemini-key', {
              body: { 
                action: 'set',
                key: defaultKey
              }
            });
            
            if (result.data?.success) {
              console.log("Default key applied automatically");
              return true;
            }
          } catch (error) {
            console.error("Error applying default key:", error);
          }
        }
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error checking API key status:", err);
      return false;
    }
  }
}

export default GeminiImageService;
