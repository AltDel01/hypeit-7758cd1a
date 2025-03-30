
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
      
      toast.info("Sending request to generate image...", { duration: 5000 });
      
      // Use the webhook instead of the API
      const webhookUrl = "https://hook.us2.make.com/yi8ng2m5p82cduxohbugpqaarphi5ofu";
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          style,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Webhook returned error:", errorData);
        toast.error(`Failed to generate image: Webhook error (${response.status})`);
        return null;
      }
      
      // Check if the response is JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (e.g. if the webhook returns an image directly)
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        toast.success("Image generated successfully!");
        return imageUrl;
      }
      
      // Process JSON response
      if (data && data.imageUrl) {
        console.log("Image generated successfully");
        toast.success("Image generated successfully!");
        return data.imageUrl;
      } else if (data && data.error) {
        console.error("Webhook returned error:", data.error);
        toast.error(`Failed to generate image: ${data.error}`);
        return null;
      } else {
        console.error("Unexpected webhook response format:", data);
        toast.error("Failed to generate image: Unexpected response format");
        return null;
      }
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
