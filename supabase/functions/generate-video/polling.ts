
import { corsHeaders, POLL_ENDPOINT } from "./config.ts";

// Cache for completed video results
// Key: operationName, Value: { videoUri, proxyUrl, timestamp }
const completedVideosCache = new Map<string, { videoUri: string; proxyUrl: string; timestamp: number }>();

// Cache expiry: 1 hour
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

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
      console.log(`Using operationName path for polling: ${operationName}`);
      return await checkGeminiOperationStatus(operationName, requestId, prompt);
    }
    
    console.log("No operationName provided, using fallback status check");
    
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
  const VEO_API_KEY = process.env.VEO_API_KEY;
  
  if (!VEO_API_KEY) {
    console.warn("VEO_API_KEY not available, falling back to direct status check");
    return handleDirectStatusCheck(requestId, prompt);
  }

  // Check cache first
  const cached = completedVideosCache.get(operationName);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_EXPIRY_MS) {
      console.log(`Returning cached result for operation ${operationName} (age: ${Math.floor(age / 1000)}s)`);
      return new Response(
        JSON.stringify({ 
          status: "completed", 
          videoUrl: cached.videoUri,
          requestId: requestId,
          message: "Video generation completed (cached)"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Cache expired, remove it
      completedVideosCache.delete(operationName);
    }
  }

  try {
    // Check operation status with Veo API
    // The operation name format is typically: operations/{operation_id}
    const operationUrl = `https://generativelanguage.googleapis.com/v1/${operationName}`;
    
    console.log(`Checking Veo operation status at: ${operationUrl}`);
    
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
    console.log(`Operation status response - done: ${operationData.done}, has error: ${!!operationData.error}`);
    console.log(`Full operation response:`, JSON.stringify(operationData).substring(0, 500));
    
    // Check if operation failed
    if (operationData.error) {
      console.error("Operation error:", operationData.error);
      return new Response(
        JSON.stringify({ 
          status: "error", 
          error: operationData.error.message || operationData.error.toString() || "Video generation failed",
          requestId: requestId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if operation is done
    if (operationData.done) {
      console.log("Operation marked as done, checking for video in response");
      
      // The response structure from Veo API is:
      // response.generateVideoResponse.generatedSamples[0].video.uri
      const videoUri = operationData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      
      if (videoUri) {
        console.log("Found video URI:", videoUri);
        
        // Add API key to the video URL
        const VEO_API_KEY = process.env.VEO_API_KEY;
        const videoUrlWithKey = videoUri.includes('?') 
          ? `${videoUri}&key=${VEO_API_KEY}` 
          : `${videoUri}?key=${VEO_API_KEY}`;
        
        console.log("Video URL prepared with API key");
        
        // Cache this result for future polls
        completedVideosCache.set(operationName, {
          videoUri: videoUrlWithKey,
          proxyUrl: videoUrlWithKey,
          timestamp: Date.now()
        });
        console.log(`Cached result for operation ${operationName}`);
        
        return new Response(
          JSON.stringify({ 
            status: "completed", 
            videoUrl: videoUrlWithKey,
            requestId: requestId,
            message: "Video generation completed"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If operation is done but no video found, log detailed info
      console.warn("Operation is done but no video data found");
      console.log("Full response structure:", JSON.stringify(operationData).substring(0, 1000));
      
      // Return error instead of completed, so frontend knows something went wrong
      return new Response(
        JSON.stringify({ 
          status: "error", 
          error: "Video generation completed but video file not found in response",
          message: "Failed to retrieve generated video",
          requestId: requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Operation still in progress
    console.log("Operation still in progress, returning processing status");
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
  console.log("Providing fallback response for video status check - this should only be temporary during API errors");
  console.log("WARNING: Actual Veo API status check failed, using demo/fallback mode");
  
  // For now, simulate a completed video after some time
  // In production, this would check the actual video generation service status
  // You could store request status in a database or cache
  
  // Simulate: if requestId exists and enough time has passed, return completed
  // Otherwise return processing
  const isCompleted = Math.random() > 0.7; // 30% chance of completion for demo (reduced from 70% to avoid false positives)
  
  if (isCompleted) {
    // Return a placeholder video URL
    // In production, this would be the actual generated video URL
    console.log("Fallback mode: Returning demo completion");
    return new Response(
      JSON.stringify({ 
        status: "completed", 
        videoUrl: "/videos/popcorn-promo-demo.mp4", // Placeholder
        message: "Video generation completed (demo mode - API check failed)" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    console.log("Fallback mode: Still processing");
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

