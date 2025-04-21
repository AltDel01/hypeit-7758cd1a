
import { dispatchImageGeneratedEvent } from '../imageEvents';

export class FallbackService {
  private static readonly UNSPLASH_BASE_URL = 'https://source.unsplash.com/featured';
  
  static async handleFallback(prompt: string, aspectRatio: string = "1:1"): Promise<void> {
    try {
      console.log(`Generating fallback image for prompt: ${prompt}`);
      
      const keywords = prompt.split(' ').slice(0, 3).join(',');
      const dimensions = this.getDimensionsFromAspectRatio(aspectRatio);
      const fallbackUrl = `${this.UNSPLASH_BASE_URL}/${dimensions}/?${encodeURIComponent(keywords)}`;
      
      dispatchImageGeneratedEvent(fallbackUrl, prompt);
    } catch (error) {
      console.error('Error in fallback handling:', error);
      // Use a completely generic fallback as last resort
      const emergencyFallback = `${this.UNSPLASH_BASE_URL}/800x800/?product`;
      dispatchImageGeneratedEvent(emergencyFallback, prompt);
    }
  }
  
  private static getDimensionsFromAspectRatio(aspectRatio: string): string {
    switch (aspectRatio) {
      case "16:9":
        return "1600x900";
      case "9:16":
        return "900x1600";
      case "4:3":
        return "1200x900";
      case "3:4":
        return "900x1200";
      default:
        return "800x800"; // 1:1 default
    }
  }
}

