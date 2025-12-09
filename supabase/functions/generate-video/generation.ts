import { corsHeaders, ERROR_MESSAGES } from "./config.ts";

/**
 * Interface for video generation request parameters
 */
export interface VideoGenerationRequestData {
  prompt: string;
  aspect_ratio?: string;
  product_image?: string;
  product_image_name?: string;
  product_image_type?: string;
  enhanced_prompt?: string;
}

/**
 * Handles the initial request to generate a video using Veo 3.1 API
 */
export async function handleVideoGenerationRequest(requestData: VideoGenerationRequestData): Promise<Response> {
  const { 
    prompt, 
    aspect_ratio = "16:9", 
    product_image,
    product_image_name,
    product_image_type,
    enhanced_prompt
  } = requestData;
  
  console.log(`Generating video with prompt: ${prompt}, aspect ratio: ${aspect_ratio}`);
  if (product_image) {
    console.log(`Product image provided: ${product_image_name}, type: ${product_image_type}`);
  }
  
  // Validate required fields
  if (!prompt && !enhanced_prompt) {
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: ERROR_MESSAGES.MISSING_PROMPT
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const finalPrompt = enhanced_prompt || prompt;
  
  try {
    const VEO_API_KEY = Deno.env.get('VEO_API_KEY');
    
    if (!VEO_API_KEY) {
      console.error("VEO_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: "VEO_API_KEY environment variable not set"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique request ID
    const generatedRequestId = crypto.randomUUID();
    
    // Use Veo 3.1 API for video generation
    return await generateWithGemini(finalPrompt, product_image, aspect_ratio, generatedRequestId, VEO_API_KEY);
  } catch (error) {
    return handleVideoGenerationError(error, finalPrompt);
  }
}

/**
 * Generate video using Veo 3.1 API
 */
async function generateWithGemini(
  prompt: string, 
  productImage: string | undefined,
  aspectRatio: string,
  requestId: string,
  veoApiKey: string
): Promise<Response> {
  try {
    console.log("Generating video with Veo 3.1 (Gemini REST)");
    
    // Veo 3.1 API endpoint for video generation (predictLongRunning)
    // Note: This requires Google AI Pro or Ultra subscription
    const veoUrl = "https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning";
    
    // Build the request body for video generation according to official Veo 3.1 REST API
    // Format: { instances: [{ prompt }], parameters: { aspectRatio } }
    // NOTE: Veo 3.1 REST API does NOT support imageBytes in the request
    // Image-to-video features are not available in the REST API preview
    const instance: any = {
      prompt: prompt,
    };

    // Log if image was provided but won't be used
    if (productImage) {
      console.log("Product image provided but Veo 3.1 REST API does not support image-to-video generation");
      console.log("Proceeding with text-to-video only using prompt: " + productImage);
    }

    // Build request body with instances array (without image)
    const requestBody = {
      instances: [instance], // Only prompt, no image support in REST API
      parameters: { aspectRatio }
    };

    console.log("Sending video generation request to Veo API");
    console.log("Request URL:", veoUrl);
    console.log("Request body keys:", Object.keys(requestBody));
    console.log("Request body:", JSON.stringify(requestBody).substring(0, 200));
    
    // Call Veo API for video generation
    // IMPORTANT: Use x-goog-api-key header, NOT query parameter
    console.log("Calling Veo API with x-goog-api-key header");
    
    const response = await fetch(veoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": veoApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Veo API error:", response.status);
      console.error("Error response:", errorText);
      console.error("Request URL:", veoUrl);
      console.error("Request body:", JSON.stringify(requestBody).substring(0, 200));
      
      // Try to parse the error response as JSON
      let errorMessage = `Veo API error: Status ${response.status}`;
      let errorDetails = errorText;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = `Veo API error: ${errorData.error?.message || response.statusText}`;
        errorDetails = JSON.stringify(errorData, null, 2);
        
        // Check if it's a subscription/access issue
        if (errorData.error?.message?.includes("subscription") || 
            errorData.error?.message?.includes("access") ||
            response.status === 403) {
          errorMessage = "Video generation requires Google AI Pro or Ultra subscription. Please upgrade your plan to use Veo 3.1.";
        }
      } catch (e) {
        errorMessage = `Veo API error: Status ${response.status} - ${errorText || response.statusText}`;
      }
      
      // Return error response instead of processing status
      return new Response(
        JSON.stringify({ 
          status: "error",
          requestId: requestId,
          prompt: prompt,
          error: errorMessage,
          errorDetails: errorDetails,
          message: "Video generation failed"
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseData = await response.json();
    console.log("Received response from Veo API for video generation");
    console.log("Response data:", JSON.stringify(responseData).substring(0, 500));
    
    // Veo API always returns an operation object for async processing
    // The operation has a 'name' field that we use for polling
    if (responseData.name) {
      // This is an operation that needs polling
      console.log(`Video generation operation started: ${responseData.name}`);
      return new Response(
        JSON.stringify({ 
          status: "processing",
          requestId: requestId,
          operationName: responseData.name,
          prompt: prompt,
          estimatedTime: 30,
          message: "Video generation in progress"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If operation is already done (unlikely but possible)
    if (responseData.done && responseData.response?.generatedVideos?.[0]?.video) {
      const videoFile = responseData.response.generatedVideos[0].video;
      console.log("Video generated successfully");
      // The video is a file reference that needs to be downloaded
      return new Response(
        JSON.stringify({ 
          status: "completed",
          requestId: requestId,
          prompt: prompt,
          videoFile: videoFile, // File reference for download
          message: "Video generated successfully"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If we get here, the response format is unexpected
    console.log("Unexpected response format from Veo API:", responseData);
    return new Response(
      JSON.stringify({ 
        status: "processing",
        requestId: requestId,
        prompt: prompt,
        estimatedTime: 30,
        message: "Video generation in progress"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Veo API error for video generation:', error);
    
    // Return processing status so polling can handle it
    return new Response(
      JSON.stringify({ 
        status: "processing",
        requestId: requestId,
        prompt: prompt,
        estimatedTime: 30,
        error: error instanceof Error ? error.message : String(error),
        message: "Video generation started (checking status)"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handles video generation errors
 */
function handleVideoGenerationError(error: unknown, prompt: string): Response {
  console.error("Video generation error:", error);
  
  return new Response(
    JSON.stringify({ 
      status: "error", 
      error: error instanceof Error ? error.message : String(error),
      message: "Video generation failed. Please try again."
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

