
import { toast } from "sonner";
import { dispatchImageGeneratedEvent } from '../imageEvents';

/**
 * Service to handle image fallback scenarios
 */
export class FallbackService {
  private static generateSeedFromPrompt(prompt: string): number {
    // Generate a deterministic seed from the prompt
    return Math.abs(prompt.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
  }

  private static getPicsumUrl(seed: number, width: number, height: number): string {
    return `https://picsum.photos/seed/${seed}/${width}/${height}.jpg`;
  }

  static async getFallbackImage(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
    try {
      const seed = this.generateSeedFromPrompt(prompt);
      const [width, height] = aspectRatio === "9:16" ? [600, 900] : [800, 800];
      return this.getPicsumUrl(seed, width, height);
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
      const emergencyFallback = "https://picsum.photos/800/800.jpg";
      dispatchImageGeneratedEvent(emergencyFallback, prompt);
    }
  }
}
