
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not set");
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const requestData = await req.json();
    const { prompt, product_image, aspect_ratio = "1:1" } = requestData;

    if (!prompt) {
      console.error("Prompt is required");
      throw new Error("Prompt is required");
    }

    console.log(`Image generation request received. Prompt: "${prompt?.substring(0, 30)}...", Has product image: ${!!product_image}, Aspect ratio: ${aspect_ratio}`);
    
    // Generate a unique request ID
    const requestId = crypto.randomUUID();
    console.log(`Assigned request ID: ${requestId}`);

    // Prepare the request to Imagen 3 API
    const imagenUrl = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";
    
    // Build the request body for Imagen 3
    // Imagen supports numberOfImages (1-4), aspectRatio, and personGeneration
    const requestBody: any = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: 1, // Generate 1 image (can be 1-4)
        aspectRatio: aspect_ratio || "1:1", // Support aspect ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
        personGeneration: "allow_adult", // Default: allow adults but not children
        safetySetting: "block_some", // Filter harmful content
        addWatermark: false // Set to false to avoid SynthID watermark (if needed)
      }
    };

    // Note: Imagen 3 doesn't support reference images in the same way as Gemini
    // If you need to use product_image, you might need to incorporate it into the prompt
    if (product_image) {
      console.log("Product image provided, but Imagen 3 doesn't support reference images directly");
      console.log("Consider adding image description to the prompt instead");
      // You could enhance the prompt with: "based on the provided product" or similar
    }

    console.log("Sending request to Imagen 3 API with prompt");
    console.log(`Using aspect ratio: ${aspect_ratio}`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    let imageData = null;
    let errorResponse = null;
    
    try {
      // Call Imagen 3 API
      const response = await fetch(`${imagenUrl}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Imagen API error:", response.status, errorText);
        
        // Try to parse the error response as JSON
        try {
          const errorData = JSON.parse(errorText);
          errorResponse = `Imagen API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          // If parsing fails, use the raw error text
          errorResponse = `Imagen API error: Status ${response.status} - ${errorText || response.statusText}`;
        }
        
        throw new Error(errorResponse);
      }
  
      const responseData = await response.json();
      console.log("Received response from Imagen 3 API");
      
      // Extract the image data from Imagen 3 response
      console.log("Response data structure:", JSON.stringify(responseData, null, 2).substring(0, 500));
      
      // Imagen 3 returns predictions array with images
      if (responseData.predictions && responseData.predictions.length > 0) {
        const prediction = responseData.predictions[0];
        
        // Imagen returns base64 encoded images in bytesBase64Encoded or image field
        if (prediction.bytesBase64Encoded) {
          imageData = prediction.bytesBase64Encoded;
          console.log("Found image data in bytesBase64Encoded field");
        } else if (prediction.image) {
          imageData = prediction.image;
          console.log("Found image data in image field");
        }
      }
    } catch (apiError) {
      console.error("API call error:", apiError);
      errorResponse = (apiError as Error).message || "Error calling Imagen API";
    }

    if (!imageData) {
      console.warn("No image data in Imagen API response, using fallback");
      console.warn("Error details:", errorResponse);
      
      // Use fallback image with Picsum (Unsplash is unreliable with 503 errors)
      // Generate a deterministic seed from the prompt for consistent results
      const seed = Math.abs(prompt.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
      
      // Use a direct Picsum URL that doesn't redirect
      const fallbackUrl = `https://picsum.photos/seed/${seed}/800/800.jpg`;
      
      console.log("Fallback image URL:", fallbackUrl);
      
      return new Response(JSON.stringify({ 
        status: "completed",
        imageUrl: fallbackUrl,
        requestId,
        message: "Using fallback image (Imagen API unavailable)",
        usedFallback: true,
        originalError: errorResponse || "No image data in Imagen API response"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the image data
    console.log("Successfully generated image with Imagen 3");
    console.log("Image data length:", imageData.length, "characters");
    
    return new Response(JSON.stringify({ 
      status: "completed",
      imageUrl: `data:image/png;base64,${imageData}`,
      requestId,
      message: "Image generated successfully with Imagen 3",
      usedFallback: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in gemini-image-generate function:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Extract prompt for fallback, even if request parsing failed
    let promptForFallback = 'product';
    try {
      const errorRequestData = await req.clone().json();
      if (errorRequestData.prompt) {
        promptForFallback = errorRequestData.prompt;
      }
    } catch (e) {
      // Ignore parsing errors in error handler
    }
    
    // Generate a fallback image URL from Picsum (use .jpg to avoid redirects)
    const seed = Math.abs(promptForFallback.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
    const fallbackImageUrl = `https://picsum.photos/seed/${seed}/800/800.jpg`;
    
    console.log("Returning fallback image due to error:", fallbackImageUrl);
    
    return new Response(
      JSON.stringify({ 
        status: "completed",  // Use "completed" since we provide a valid image
        imageUrl: fallbackImageUrl,
        requestId: crypto.randomUUID(),
        message: "Using fallback image due to error",
        usedFallback: true,
        originalError: error instanceof Error ? error.message : String(error)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
