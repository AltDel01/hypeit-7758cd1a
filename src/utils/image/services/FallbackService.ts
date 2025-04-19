
import { toast } from "sonner";
import { dispatchImageGeneratedEvent } from '../imageEvents';

/**
 * Service to handle image fallback scenarios
 */
export class FallbackService {
  private static extractKeywords(prompt: string): string[] {
    return prompt
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3);
  }

  private static getUnsplashUrl(keywords: string[], size: string = '800x800'): string {
    const searchTerms = keywords.join(',');
    const timestamp = Date.now();
    return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(searchTerms)}&t=${timestamp}`;
  }

  static async getFallbackImage(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
    try {
      const keywords = this.extractKeywords(prompt);
      const size = aspectRatio === "9:16" ? "600x900" : "800x800";
      return this.getUnsplashUrl(keywords, size);
    } catch (error) {
      console.error("Error getting fallback image:", error);
      return "https://placehold.co/800x800/333/white?text=Image+Generation+Failed";
    }
  }

  static async handleFallback(prompt: string, aspectRatio: string = "1:1"): Promise<void> {
    try {
      const fallbackUrl = await this.getFallbackImage(prompt, aspectRatio);
      toast.info("Using alternative image source", { id: "fallback-image" });
      dispatchImageGeneratedEvent(fallbackUrl, prompt);
    } catch (error) {
      console.error("Error in fallback handling:", error);
      const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
      dispatchImageGeneratedEvent(emergencyFallback, prompt);
    }
  }
}
