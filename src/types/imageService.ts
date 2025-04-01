
export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  style?: string;
  productImage?: File | null;
}

export interface ImageGenerationResponse {
  status: string;
  message?: string;
  requestId?: string;
  imageUrl?: string;
  error?: string;
}

export interface ImageGenerationProgress {
  status: string;
  progress?: number;
}
