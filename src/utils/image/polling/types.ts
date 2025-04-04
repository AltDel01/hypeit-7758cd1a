
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
  forceWebhook?: boolean;
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
  isWebhook?: boolean;
  progress?: number;
}

/**
 * Interface for webhook payload
 */
export interface WebhookPayload {
  requestId: string;
  prompt: string;
  imageReference?: string;
  mimeType?: string;
  aspectRatio?: string;
  style?: string;
}
