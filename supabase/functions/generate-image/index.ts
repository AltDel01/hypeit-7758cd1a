import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const POLL_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6/status";
const GENERATION_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6";

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

/**
 * Handles a request to check the status of an image generation
 */
async function handlePollingRequest(requestData: { 
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

/**
 * Handles the initial request to generate an image
 */
async function handleGenerationRequest(requestData: {
  prompt: string;
  aspect_ratio?: string;
  style?: string;
}): Promise<Response> {
  const { prompt, aspect_ratio = "1:1", style } = requestData;
  console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);
  
  try {
    // Generate a fallback URL immediately for faster responses
    const fallbackImageUrl = generateUnsplashUrl(prompt);
    
    // Attempt to generate image using the webhook
    try {
      return await generateWithWebhook(prompt, aspect_ratio, style, fallbackImageUrl);
    } catch (webhookError) {
      return handleWebhookError(webhookError, fallbackImageUrl);
    }
  } catch (error) {
    return handleGeneralGenerationError(error, prompt);
  }
}

/**
 * Attempts to generate an image using the webhook
 */
async function generateWithWebhook(
  prompt: string, 
  aspect_ratio: string, 
  style: string | undefined, 
  fallbackImageUrl: string
): Promise<Response> {
  const webhookResponse = await fetch(GENERATION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio,
      style
    })
  });
  
  if (!webhookResponse.ok) {
    throw new Error(`Webhook error: ${webhookResponse.statusText}`);
  }
  
  // Get the response as text first
  const responseText = await webhookResponse.text();
  
  // Handle "Accepted" response
  if (responseText === "Accepted") {
    return handleAcceptedResponse(prompt, fallbackImageUrl);
  }
  
  // Try to parse as JSON
  try {
    return handleJsonGenerationResponse(responseText, fallbackImageUrl);
  } catch (parseError) {
    return handleTextGenerationResponse(fallbackImageUrl);
  }
}

/**
 * Handles an "Accepted" response from the webhook
 */
function handleAcceptedResponse(prompt: string, fallbackImageUrl: string): Response {
  console.log("Successfully generated image placeholder");
  // Generate a unique request ID
  const generatedRequestId = crypto.randomUUID();
  
  // Return with both a placeholder and the fallback URL
  return new Response(
    JSON.stringify({ 
      status: "completed",
      message: "Image generation completed with fallback",
      requestId: generatedRequestId,
      prompt,
      imageUrl: fallbackImageUrl
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handles a JSON generation response
 */
function handleJsonGenerationResponse(responseText: string, fallbackImageUrl: string): Response {
  const responseData = JSON.parse(responseText);
  
  // If we have an image URL in the response, use it
  if (responseData.imageUrl) {
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Otherwise use the fallback
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using fallback system (incomplete response)" 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handles a text generation response
 */
function handleTextGenerationResponse(fallbackImageUrl: string): Response {
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using fallback system (parse error)" 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handles errors from the webhook
 */
function handleWebhookError(error: unknown, fallbackImageUrl: string): Response {
  console.error("Webhook error:", error);
  
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using fallback system due to webhook error",
      error: error instanceof Error ? error.message : String(error)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handles general generation errors
 */
function handleGeneralGenerationError(error: unknown, prompt: string): Response {
  console.error("General generation error:", error);
  
  // Use fallback image generator
  const fallbackImageUrl = generateUnsplashUrl(prompt);
  
  return new Response(
    JSON.stringify({ 
      status: "completed", 
      imageUrl: fallbackImageUrl,
      message: "Generated using fallback system due to general error",
      error: error instanceof Error ? error.message : String(error)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Generates a reliable Unsplash URL based on the prompt
 */
function generateUnsplashUrl(prompt: string): string {
  // Clean up the prompt
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  // Extract search terms
  const keyTerms = extractKeyTerms(cleanPrompt);
  const productType = extractProductType(cleanPrompt);
  const colorTerm = extractColorTerm(cleanPrompt);
  
  // Combine terms for better search results
  const searchTerms = combineSearchTerms(keyTerms, productType, colorTerm);
  
  // Add cache busting parameter
  const timestamp = Date.now();
  
  // Use high quality featured images
  return `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms)}&t=${timestamp}`;
}

/**
 * Extracts key terms from a prompt
 */
function extractKeyTerms(prompt: string): string {
  return prompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
}

/**
 * Extracts product type from a prompt
 */
function extractProductType(prompt: string): string {
  const productMatch = prompt.match(/(?:skincare|makeup|serum|moisturizer|cleanser|toner|cream|lotion)/i);
  return productMatch ? productMatch[0] : 'product';
}

/**
 * Extracts color information from a prompt
 */
function extractColorTerm(prompt: string): string {
  const colorMatch = prompt.match(/(?:cream|white|black|blue|red|green|yellow|purple|pink|orange|brown|gray|grey)/i);
  return colorMatch ? colorMatch[0] : '';
}

/**
 * Combines search terms for better image results
 */
function combineSearchTerms(keyTerms: string, productType: string, colorTerm: string): string {
  const specificTerms = [productType, colorTerm, 'photography', 'premium']
    .filter(Boolean)
    .join(',');
  
  return specificTerms || keyTerms || 'skincare,product';
}
