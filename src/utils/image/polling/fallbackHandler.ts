
import { toast } from "sonner";
import { FallbackService } from '../services/FallbackService';
import { dispatchImageGenerationErrorEvent, dispatchImageGeneratedEvent } from '../imageEvents';

export async function useFallbackImage(prompt: string, aspectRatio: string): Promise<void> {
  const fallbackUrl = await FallbackService.getFallbackImage(prompt, aspectRatio);
  toast.info("Using fallback image", { id: "fallback-image" });
  dispatchImageGeneratedEvent(fallbackUrl, prompt);
}

export function handleFallbackError(error: any, prompt: string): void {
  console.error("Error in fallback handling:", error);
  dispatchImageGenerationErrorEvent(
    error instanceof Error ? error.message : String(error),
    prompt
  );
}
