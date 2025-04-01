
/**
 * Types related to image polling
 */

/**
 * Parameters for polling an image generation request
 */
export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries?: number;
  delay?: number;
  maxRetries?: number;
}

/**
 * Interface representing the result of an image status check
 */
export interface ImageStatusResult {
  error?: any;
  status?: string;
  imageUrl?: string;
  apiError?: any;
  data?: any;
}
