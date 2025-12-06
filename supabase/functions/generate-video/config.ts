
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

// Error Messages
export const ERROR_MESSAGES = {
  TIMEOUT: "Request timed out while waiting for video generation",
  SERVER_ERROR: "Server error occurred during video generation",
  INVALID_RESPONSE: "Invalid response received from video generation service",
  MISSING_PROMPT: "Missing required field: prompt",
  MISSING_IMAGE: "Missing required field: product_image"
};

// Video generation API configuration
// Required environment variable:
// - VEO_API_KEY: For Veo 3.1 video generation
// Note: Veo 3.1 requires Google AI Pro or Ultra subscription

