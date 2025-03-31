
/**
 * Parameters for generating an image 
 */
export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: "1:1" | "9:16";
  style?: string;
}

/**
 * Response from the image generation service
 */
export interface ImageGenerationResponse {
  imageUrl?: string;
  requestId?: string;
  status?: string;
  error?: string;
  message?: string;
}
