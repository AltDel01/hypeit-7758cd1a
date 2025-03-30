
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
      
      // Use webhook instead of supabase function
      const webhookUrl = "https://hook.us2.make.com/yi8ng2m5p82cduxohbugpqaarphi5ofu";
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          style
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from webhook:", errorText);
        toast.error(`Failed to generate image: ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Webhook returned error:", data.error);
        toast.error(`Failed to generate image: ${data.error}`);
        return null;
      }
      
      console.log("Image generated successfully:", data.imageUrl);
      toast.success("Image generated successfully!");
      
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
