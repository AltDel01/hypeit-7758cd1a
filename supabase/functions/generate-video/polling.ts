
import { corsHeaders, POLL_ENDPOINT } from "./config.ts";

/**
 * Handles a request to check the status of a video generation
 */
export async function handleVideoPollingRequest(requestData: { 
  requestId: string, 
  checkOnly?: boolean,
  prompt?: string,
  operationName?: string
}): Promise<Response> {
  const { requestId, checkOnly, prompt = "video", operationName } = requestData;
  console.log(`Polling for video status, requestId: ${requestId}, checkOnly: ${checkOnly}, operationName: ${operationName || 'undefined'}`);
  
  // If operationName is missing, we can't poll properly
  if (!operationName && checkOnly) {
    console.warn("operationName is missing, cannot poll Veo API");
    return handleDirectStatusCheck(requestId, prompt);
  }
  
  try {
    // If we have an operation name, check Veo API directly
    if (operationName) {
      return await checkGeminiOperationStatus(operationName, requestId, prompt);
    }
    
    // For direct status checks (without webhook), return a processing or completed response
    if (checkOnly) {
      return handleDirectStatusCheck(requestId, prompt);
    }
    
    // Make the status check request to the webhook
    try {
      return await checkStatusWithWebhook(requestId, prompt);
    } catch (webhookError) {
      console.error("Webhook status check failed:", webhookError);
      // Fall back to direct check if webhook fails
      return handleDirectStatusCheck(requestId, prompt);
    }
  } catch (error) {
    return handlePollingError(error, prompt);
  }
}

/**
 * Checks the status of a Veo video generation operation
 */
async function checkGeminiOperationStatus(
  operationName: string,
  requestId: string,
  prompt: string
): Promise<Response> {
  const VEO_API_KEY = Deno.env.get("VEO_API_KEY");
  
  if (!VEO_API_KEY) {
    return handleDirectStatusCheck(requestId, prompt);
  }

  try {
    // Check operation status with Veo API
    // The operation name format is typically: operations/{operation_id}
    const operationUrl = `https://generativelanguage.googleapis.com/v1/${operationName}`;
    
    // IMPORTANT: Use x-goog-api-key header, NOT query parameter
    const response = await fetch(operationUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": VEO_API_KEY,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error checking Veo operation status:", response.status, errorText);
      return handleDirectStatusCheck(requestId, prompt);
    }

    const operationData = await response.json();
    
    // Check if operation is done
    if (operationData.done) {
      // Operation completed - check for video in response
      // According to official docs: operation.response.generatedVideos[0].video
      if (operationData.response?.generatedVideos?.[0]?.video) {
        const videoFile = operationData.response.generatedVideos[0].video;
        
        // Download the video file from Veo API
        // The video file reference has a 'name' field like "files/..."
        // Note: For actual download, may need to use fetch with x-goog-api-key header
        try {
          const downloadUrl = `https://generativelanguage.googleapis.com/v1/${videoFile.name}?alt=media`;
          
          // Return the download URL and file info
          return new Response(
            JSON.stringify({ 
              status: "completed", 
              videoUrl: downloadUrl, // Direct download URL
              videoFile: videoFile, // File reference for additional info
              requestId: requestId,
              message: "Video generation completed"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (downloadError) {
          console.error("Error preparing video download URL:", downloadError);
          // Return file reference if download URL creation fails
          return new Response(
            JSON.stringify({ 
              status: "completed", 
              videoFile: videoFile, // File reference object
              requestId: requestId,
              message: "Video generation completed (download URL unavailable)"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (operationData.error) {
        // Operation failed
        return new Response(
          JSON.stringify({ 
            status: "error", 
            error: operationData.error.message || "Video generation failed",
            requestId: requestId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Operation still in progress
    return new Response(
      JSON.stringify({ 
        status: "processing", 
        message: "Video is still being generated",
        estimatedTime: 20,
        requestId: requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error checking Veo operation:", error);
    return handleDirectStatusCheck(requestId, prompt);
  }
}

/**
 * Handles direct status checks without calling the webhook
 */
function handleDirectStatusCheck(requestId: string, prompt: string): Response {
  console.log("Providing fallback response for video status check");
  
  // For now, simulate a completed video after some time
  // In production, this would check the actual video generation service status
  // You could store request status in a database or cache
  
  // Simulate: if requestId exists and enough time has passed, return completed
  // Otherwise return processing
  const isCompleted = Math.random() > 0.3; // 70% chance of completion for demo
  
  if (isCompleted) {
    // Return a placeholder video URL
    // In production, this would be the actual generated video URL
    return new Response(
      JSON.stringify({ 
        status: "completed", 
        videoUrl: "/videos/popcorn-promo-demo.mp4", // Placeholder
        message: "Video generation completed (demo mode)" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    return new Response(
      JSON.stringify({ 
        status: "processing", 
        message: "Video is still being generated",
        estimatedTime: 20
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Checks the status of a video generation with the webhook
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
      console.log("Video status response:", statusData);
      
      // If completed but no video URL, use fallback
      if (statusData.status === "completed" && !statusData.videoUrl) {
        statusData.videoUrl = "/videos/popcorn-promo-demo.mp4";
        statusData.message = "Video generation completed (fallback)";
      }
      
      return new Response(
        JSON.stringify(statusData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (jsonError) {
      // If not JSON, handle as text
      const textResponse = await statusResponse.text();
      console.log("Video status response text:", textResponse);
      
      return new Response(
        JSON.stringify({ 
          status: "processing", 
          message: "Video generation in progress"
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
  console.error("Error polling for video status:", error);
  
  return new Response(
    JSON.stringify({ 
      status: "error", 
      error: error instanceof Error ? error.message : String(error),
      message: "Failed to check video generation status"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

