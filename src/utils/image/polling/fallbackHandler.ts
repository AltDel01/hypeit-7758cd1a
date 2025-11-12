
import { toast } from "sonner";
import { FallbackService } from '../services/FallbackService';
import { dispatchImageGeneratedEvent } from '../imageEvents';

export async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  // Fallback image generation is disabled
  console.log("Fallback image generation is disabled");
}

export function handleFallbackError(error: any, prompt: string): void {
  console.error("Error in fallback handling:", error);
  // Fallback image generation is disabled
}
