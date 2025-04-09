
import { toast } from "sonner";
import { PollImageParams } from "./types";
import { PollingManager } from "./PollingManager";

/**
 * Main function that polls for the result of an image generation request
 */
export async function pollForImageResult(params: PollImageParams): Promise<void> {
  PollingManager.startPolling(params);
}

/**
 * Cancels all active polling operations
 * Useful when changing tabs or starting a new generation
 */
export function cancelAllActivePolls(): void {
  PollingManager.cancelAllPolls();
}
