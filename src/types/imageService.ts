
/**
 * Interface for image generation parameters
 */
export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  style?: string;
  productImage?: File | null;
  imageReference?: string;
  mimeType?: string;
}

/**
 * Interface for image generation response
 */
export interface ImageGenerationResponse {
  status: string;
  requestId?: string;
  imageUrl?: string;
  error?: string;
  message?: string;
  isWebhook?: boolean;
}
