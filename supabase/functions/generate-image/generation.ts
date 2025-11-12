
import { corsHeaders } from "./config.ts";
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
    // Generate an Unsplash URL directly instead of using webhook
    const fallbackImageUrl = generateUnsplashUrl(prompt);
    
    // Generate a unique request ID
    const generatedRequestId = crypto.randomUUID();
    
    // Return success response with the image URL
    return new Response(
      JSON.stringify({ 
        status: "completed",
        message: "Image generation completed",
        requestId: generatedRequestId,
        prompt,
        imageUrl: fallbackImageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return handleGeneralGenerationError(error, prompt);
  }
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
