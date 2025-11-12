
// If the file doesn't exist, we'll create it with the necessary types
export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  style?: string;
  productImage?: File | null;
  requestId?: string; // Add requestId parameter
}

export interface ImageGenerationResponse {
  imageUrl?: string;
  status?: string;
  requestId?: string;
  error?: string;
}
