import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateVideoInput } from "./config.ts";
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
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: "Invalid JSON in request body"
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if this is a polling request
    if (requestData.requestId) {
      return await handleVideoPollingRequest(requestData);
    }
    
    // Validate input for video generation
    const validation = validateVideoInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: validation.error
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Otherwise, handle initial video generation request
    return await handleVideoGenerationRequest(requestData);
  } catch (error) {
    // Handle any unexpected errors
    console.error('General error in generate-video function');
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: "Video generation failed due to server error",
        message: "Video generation failed due to server error"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

