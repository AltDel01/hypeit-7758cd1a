
import { corsHeaders, GENERATION_ENDPOINT } from "./config.ts";
import { generateUnsplashUrl } from "./unsplash.ts";

/**
 * Interface for generation request parameters
 */
interface GenerationRequestData {
  prompt: string;
  aspect_ratio?: string;
  style?: string;
  product_image?: string;
  product_image_name?: string;
  product_image_type?: string;
}

/**
 * Handles the initial request to generate an image
 */
export async function handleGenerationRequest(requestData: GenerationRequestData): Promise<Response> {
  const { 
    prompt, 
    aspect_ratio = "1:1", 
    style,
    product_image,
    product_image_name,
    product_image_type
  } = requestData;
  
  console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);
  if (product_image) {
    console.log(`Product image provided: ${product_image_name}, type: ${product_image_type}`);
  }
  
  try {
    // Generate a fallback URL immediately for faster responses
    const fallbackImageUrl = generateUnsplashUrl(prompt);
    
    // Attempt to generate image using the webhook
    try {
      return await generateWithWebhook(requestData, fallbackImageUrl);
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
  requestData: GenerationRequestData,
  fallbackImageUrl: string
): Promise<Response> {
  // Make a copy of the request data to avoid modifying the original
  const webhookRequestBody = { ...requestData };
  
  const webhookResponse = await fetch(GENERATION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookRequestBody)
  });
  
  if (!webhookResponse.ok) {
    throw new Error(`Webhook error: ${webhookResponse.statusText}`);
  }
  
  // Get the response as text first
  const responseText = await webhookResponse.text();
  
  // Handle "Accepted" response
  if (responseText === "Accepted") {
    return handleAcceptedResponse(requestData.prompt, fallbackImageUrl);
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
