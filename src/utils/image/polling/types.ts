
// Types for image polling functionality

export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries: number;
  delay: number;
  maxRetries: number;
  originalRequestId?: string; // Add this property to fix the error
}

export interface ImageStatusResult {
  status?: string;
  imageUrl?: string;
  data?: any;
  error?: string;
  apiError?: string;
}
