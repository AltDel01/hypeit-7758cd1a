
import { corsHeaders } from "./config.ts";
import { generateUnsplashUrl } from "./unsplash.ts";

/**
 * Handles initial image generation request
 */
export async function handleGenerationRequest(requestData: any) {
  try {
    console.log("Processing image generation request:", requestData);
    
    // Extract parameters from request
    const { prompt, aspect_ratio, style, product_image, image_reference, mime_type } = requestData;
    
    if (!prompt) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: "No prompt provided",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a unique request ID
    const requestId = crypto.randomUUID();
    
    // Store the request in a database or cache
    // This is where you would typically call your AI model or image generation service
    
    // Determine if this is a product image or image reference request
    const isReferenceImage = !!image_reference;
    const isProductImage = !!product_image;
    const useWebhook = isReferenceImage || isProductImage;
    
    console.log(`Request type - Reference image: ${isReferenceImage}, Product image: ${isProductImage}, Using webhook: ${useWebhook}`);
    
    // For demo purposes, we create a placeholder image URL
    let placeholderUrl;
    
    // Choose a placeholder URL based on request type
    if (isReferenceImage) {
      placeholderUrl = "https://via.placeholder.com/600x600?text=Processing+Reference+Image...";
    } else if (isProductImage) {
      placeholderUrl = "https://via.placeholder.com/600x600?text=Processing+Product+Image...";
    } else {
      placeholderUrl = generateUnsplashUrl(prompt);
    }
    
    // Add a timestamp to prevent caching
    placeholderUrl = `${placeholderUrl}${placeholderUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    // Return an "accepted" status with the request ID
    return new Response(
      JSON.stringify({
        status: "accepted",
        requestId,
        imageUrl: placeholderUrl,
        message: `Image generation request accepted and processing ${useWebhook ? "with webhook" : "in background"}`,
        isWebhook: useWebhook
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in handleGenerationRequest:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
