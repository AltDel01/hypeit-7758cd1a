import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { handlePollingRequest } from "./polling.ts";
import { handleGenerationRequest } from "./generation.ts";

/**
 * Main request handler for the generate-image function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Check if this is a polling request
    if (requestData.requestId) {
      return await handlePollingRequest(requestData);
    }
    
    // Otherwise, handle initial image generation request
    return await handleGenerationRequest(requestData);
  } catch (error) {
    // Handle any unexpected errors
    console.error('General error in generate-image function:', error);
    
    // Create fallback image with emergency parameters
    let promptFromError = "product";
    try {
      const requestBody = await req.json();
      if (requestBody.prompt) {
        promptFromError = requestBody.prompt;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    const { generateUnsplashUrl } = await import("./unsplash.ts");
    const fallbackImageUrl = generateUnsplashUrl(promptFromError);
    
    return new Response(
      JSON.stringify({ 
        status: "completed",
        imageUrl: fallbackImageUrl,
        message: "Emergency fallback due to server error",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
