
import { corsHeaders } from "./config.ts";

/**
 * Handles polling requests for image generation status
 */
export async function handlePollingRequest(requestData: any) {
  try {
    console.log("Processing polling request:", requestData);
    
    // Extract request ID and check-only flag from request
    const { requestId, checkOnly, imageReference, mimeType, isWebhook } = requestData;
    
    if (!requestId) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: "No requestId provided for polling",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Here you would typically check the status of the image generation request
    // in your database or cache
    
    // Check if this is a webhook request with an image reference
    const useWebhook = isWebhook || !!imageReference;
    console.log(`Webhook status: ${useWebhook}, Image reference: ${!!imageReference}`);
    
    // For demo purposes, we'll simulate a completed status with a higher chance 
    // if it's a webhook request with reference image
    
    // Simulate some processing time during polling
    // Higher completion chance for webhook requests
    const completionChance = useWebhook ? 0.5 : 0.3; // 50% for webhook, 30% for regular
    const isCompleted = Math.random() > (1 - completionChance); 
    
    if (isCompleted) {
      // For demo purposes, return a simulated "completed" response with an image URL
      // This would be the actual generated image URL in a real implementation
      let imageUrl;
      
      if (imageReference) {
        // Use a product-specific image for reference-based generations
        imageUrl = "https://source.unsplash.com/featured/800x800/?product,customized&t=" + Date.now();
      } else if (useWebhook) {
        // Use a webhook-specific image for webhook requests
        imageUrl = "https://source.unsplash.com/featured/800x800/?product,design&t=" + Date.now();
      } else {
        // Use a generic image for regular requests
        imageUrl = "https://source.unsplash.com/featured/800x800/?product&t=" + Date.now();
      }
      
      return new Response(
        JSON.stringify({
          status: "completed",
          imageUrl,
          message: "Image generation completed successfully",
          isWebhook: useWebhook
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Calculate progress based on request data and time
      // For demo, simulate progress based on requestId
      let progress = 0;
      
      try {
        // Extract first 6 chars of requestId and convert to a number
        const requestIdNum = parseInt(requestId.substring(0, 6), 16);
        // Use the last digit to determine progress rate (0-9)
        const progressRate = (requestIdNum % 10) + 1;
        
        // Calculate progress based on polling attempt (simulated)
        const progressIncrement = 15 + progressRate; // 15-25% increment per attempt
        
        if (requestData._pollingAttempt) {
          progress = Math.min(99, progressIncrement * requestData._pollingAttempt);
        } else {
          progress = Math.min(99, 15 + progressRate); // Initial progress 15-25%
        }
        
        // Once progress gets to 90+, have a higher chance of completion next time
        if (progress >= 90) {
          progress = 95; // Cap at 95% until complete
        }
        
        console.log(`Calculated progress: ${progress}% for request ${requestId}`);
      } catch (e) {
        // Default progress if calculation fails
        progress = 50;
      }
      
      // Return "processing" status with progress
      return new Response(
        JSON.stringify({
          status: "processing",
          message: "Image generation is still in progress",
          progress: progress,
          isWebhook: useWebhook
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in handlePollingRequest:", error);
    
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
