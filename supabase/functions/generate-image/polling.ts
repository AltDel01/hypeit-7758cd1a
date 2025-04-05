
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
    // For direct status checks (without webhook), return a mock response
    if (checkOnly) {
      return handleDirectStatusCheck(prompt);
    }
    
    // Make the status check request to the Make.com webhook
    return await checkStatusWithWebhook(requestId, prompt);
  } catch (error) {
    return handlePollingError(error, prompt);
  }
}

/**
 * Handles direct status checks without calling the webhook
 */
function handleDirectStatusCheck(prompt: string): Response {
  console.log("Providing mock response for status check");
  // This simulates a completed image generation
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
  const statusResponse = await fetch(`${POLL_ENDPOINT}?requestId=${requestId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!statusResponse.ok) {
    throw new Error(`Status check error: ${statusResponse.statusText}`);
  }
  
  // Try to parse the response as JSON
  try {
    return await handleJsonStatusResponse(statusResponse, prompt);
  } catch (jsonError) {
    // If not JSON, handle as text
    return await handleTextStatusResponse(statusResponse, prompt);
  }
}

/**
 * Handles JSON status responses
 */
async function handleJsonStatusResponse(response: Response, prompt: string): Promise<Response> {
  const statusData = await response.json();
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
}

/**
 * Handles text status responses
 */
async function handleTextStatusResponse(response: Response, prompt: string): Promise<Response> {
  const textResponse = await response.text();
  console.log("Status response text:", textResponse);
  
  // If the response is "completed", generate a fallback
  if (textResponse.toLowerCase().includes("completed")) {
    const fallbackImageUrl = generateUnsplashUrl(prompt);
    
    return new Response(
      JSON.stringify({ 
        status: "completed", 
        imageUrl: fallbackImageUrl,
        message: "Generated using Unsplash"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ status: textResponse }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handles errors during polling
 */
function handlePollingError(error: unknown, prompt: string): Response {
  console.error("Error polling for status:", error);
  
  // Use fallback image generator for any polling errors
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
