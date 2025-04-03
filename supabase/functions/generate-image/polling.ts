
import { corsHeaders, POLL_ENDPOINT } from "./config.ts";
import { generateUnsplashUrl } from "./unsplash.ts";

/**
 * Handles a request to check the status of an image generation
 */
export async function handlePollingRequest(requestData: { 
  requestId: string, 
  checkOnly?: boolean,
  prompt?: string 
}): Promise<Response> {
  const { requestId, checkOnly, prompt = "product" } = requestData;
  console.log(`Polling for image status, requestId: ${requestId}, checkOnly: ${checkOnly}`);
  
  try {
    // For direct status checks (without webhook), return a completed response
    if (checkOnly) {
      return handleDirectStatusCheck(prompt);
    }
    
    // Make the status check request to the webhook
    try {
      return await checkStatusWithWebhook(requestId, prompt);
    } catch (webhookError) {
      console.error("Webhook status check failed:", webhookError);
      // Fall back to direct check if webhook fails
      return handleDirectStatusCheck(prompt);
    }
  } catch (error) {
    return handlePollingError(error, prompt);
  }
}

/**
 * Handles direct status checks without calling the webhook
 */
function handleDirectStatusCheck(prompt: string): Response {
  console.log("Providing fallback response for status check");
  const fallbackImageUrl = generateUnsplashUrl(prompt);
  
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using Unsplash (direct fallback)" 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Checks the status of an image generation with the webhook
 */
async function checkStatusWithWebhook(requestId: string, prompt: string): Promise<Response> {
  // Set a timeout for the webhook request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const statusResponse = await fetch(`${POLL_ENDPOINT}?requestId=${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!statusResponse.ok) {
      throw new Error(`Status check error: ${statusResponse.statusText}`);
    }
    
    // Try to parse the response as JSON
    try {
      const statusData = await statusResponse.json();
      console.log("Status response:", statusData);
      
      // If completed but no image URL, generate a fallback
      if (statusData.status === "completed" && !statusData.imageUrl) {
        const fallbackImageUrl = generateUnsplashUrl(prompt);
        statusData.imageUrl = fallbackImageUrl;
        statusData.message = "Generated using Unsplash (fallback)";
      }
      
      return new Response(
        JSON.stringify(statusData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (jsonError) {
      // If not JSON, handle as text
      const textResponse = await statusResponse.text();
      console.log("Status response text:", textResponse);
      
      const fallbackImageUrl = generateUnsplashUrl(prompt);
      
      return new Response(
        JSON.stringify({ 
          status: "completed", 
          imageUrl: fallbackImageUrl,
          message: "Generated using Unsplash (text response fallback)"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Handles errors during polling
 */
function handlePollingError(error: unknown, prompt: string): Response {
  console.error("Error polling for status:", error);
  
  // Always use fallback image generator for any polling errors
  const fallbackImageUrl = generateUnsplashUrl(prompt);
  
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using fallback system due to polling error",
      error: error instanceof Error ? error.message : String(error)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
