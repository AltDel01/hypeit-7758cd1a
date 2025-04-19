
import { toast } from "sonner";
import { FallbackService } from '../services/FallbackService';
import { dispatchImageGeneratedEvent } from '../imageEvents';

export async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  await FallbackService.handleFallback(prompt, aspectRatio);
}

export function handleFallbackError(error: any, prompt: string): void {
  console.error("Error in fallback handling:", error);
  const emergencyFallback = "https://source.unsplash.com/featured/800x800/?product";
  dispatchImageGeneratedEvent(emergencyFallback, prompt);
}
