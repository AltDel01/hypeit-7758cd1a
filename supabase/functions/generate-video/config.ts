// Configuration for the generate-video edge function

// Define CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
export const POLL_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6/video-status";

// Timeouts
export const REQUEST_TIMEOUT = 60000; // 60 seconds for video generation
export const MAX_RETRIES = 3;
export const POLLING_INTERVAL = 5000; // 5 seconds between polls

// Input validation constants
export const MAX_PROMPT_LENGTH = 2000;
export const VALID_ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4'];
export const MAX_IMAGE_SIZE = 10000000; // ~7.5MB in base64

// Error Messages
export const ERROR_MESSAGES = {
  TIMEOUT: "Request timed out while waiting for video generation",
  SERVER_ERROR: "Server error occurred during video generation",
  INVALID_RESPONSE: "Invalid response received from video generation service",
  MISSING_PROMPT: "Missing required field: prompt",
  MISSING_IMAGE: "Missing required field: product_image",
  INVALID_INPUT: "Invalid input provided"
};

// Video generation API configuration
// Required environment variable:
// - VEO_API_KEY: For Veo 3.1 video generation
// Note: Veo 3.1 requires Google AI Pro or Ultra subscription

// Input validation function
export const validateVideoInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { prompt, enhanced_prompt, aspect_ratio, product_image } = data;

  // At least one prompt must be provided
  if (!prompt && !enhanced_prompt) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_PROMPT };
  }

  // Validate prompt length
  const finalPrompt = enhanced_prompt || prompt;
  if (typeof finalPrompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' };
  }

  if (finalPrompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters` };
  }

  // Validate aspect ratio
  if (aspect_ratio && !VALID_ASPECT_RATIOS.includes(aspect_ratio)) {
    return { valid: false, error: `Invalid aspect ratio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` };
  }

  // Validate product image if provided
  if (product_image) {
    if (typeof product_image !== 'string') {
      return { valid: false, error: 'Product image must be a string' };
    }

    if (product_image.length > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Product image is too large (max ~7.5MB)' };
    }
  }

  return { valid: true };
};

