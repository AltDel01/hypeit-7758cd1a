import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { handleVideoPollingRequest } from "./polling.ts";
import { handleVideoGenerationRequest } from "./generation.ts";

/**
 * Main request handler for the generate-video function
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
      return await handleVideoPollingRequest(requestData);
    }
    
    // Otherwise, handle initial video generation request
    return await handleVideoGenerationRequest(requestData);
  } catch (error) {
    // Handle any unexpected errors
    console.error('General error in generate-video function:', error);
    
    // Create fallback response
    let promptFromError = "video";
    try {
      const requestBody = await req.json();
      if (requestBody.prompt || requestBody.enhanced_prompt) {
        promptFromError = requestBody.prompt || requestBody.enhanced_prompt;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        message: "Video generation failed due to server error"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

