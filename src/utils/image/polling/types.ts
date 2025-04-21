
// Types for image polling functionality
export interface PollImageParams {
  requestId: string;
  prompt: string;
  aspectRatio: string;
  style?: string;
  retries: number;
  delay: number;
  maxRetries: number;
}

export interface ImageStatusResult {
  status?: string;
  imageUrl?: string;
  data?: any;
  error?: string;
  apiError?: string;
}

export interface PollingConfig {
  MAX_RETRIES: number;
  INITIAL_DELAY: number;
  MAX_DELAY: number;
}

