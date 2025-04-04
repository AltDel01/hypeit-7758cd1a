
/**
 * Interface for image polling parameters
 */
export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio?: string;
  style?: string;
  imageReference?: string;
  mimeType?: string;
}

/**
 * Interface for image status result
 */
export interface ImageStatusResult {
  status?: string;
  imageUrl?: string;
  apiError?: string;
  error?: any;
  data?: any;
}
