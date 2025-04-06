
// Configuration for the generate-image edge function

// Define CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
export const POLL_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6/status";
export const GENERATION_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6";

// Timeouts
export const REQUEST_TIMEOUT = 20000; // 20 seconds
export const MAX_RETRIES = 3;

// Error Messages
export const ERROR_MESSAGES = {
  TIMEOUT: "Request timed out while waiting for response",
  SERVER_ERROR: "Server error occurred",
  INVALID_RESPONSE: "Invalid response received from server",
  MISSING_PROMPT: "Missing required field: prompt"
};
