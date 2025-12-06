
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

    // Prepare the request to Gemini API
    const genaiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";
    
    // Build the request body - Gemini 2.0 Flash image generation format
    const requestBody: any = {
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["image"],
        responseMimeType: "image/jpeg"
      }
    };

    // Add product image if provided
    if (product_image) {
      try {
        console.log("Product image provided, adding to request");
        
        const mimeType = product_image.startsWith("data:image/") ? 
          product_image.split(';')[0].split(':')[1] : 
          "image/jpeg";
          
        const base64Data = product_image.includes("base64,") ? 
          product_image.split("base64,")[1] : 
          product_image;
        
        requestBody.contents[0].parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
        
        console.log("Product image added to request with mime type:", mimeType);
      } catch (imageError) {
        console.error("Error processing product image:", imageError);
      }
    }

    console.log("Sending request to Gemini API with prompt");
    console.log(`Using aspect ratio: ${aspect_ratio}`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    let imageData = null;
    let textResponse = null;
    let errorResponse = null;
    
    try {
      // Call Gemini API
      const response = await fetch(`${genaiUrl}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        
        // Try to parse the error response as JSON
        try {
          const errorData = JSON.parse(errorText);
          errorResponse = `Gemini API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          // If parsing fails, use the raw error text
          errorResponse = `Gemini API error: Status ${response.status} - ${errorText || response.statusText}`;
        }
        
        throw new Error(errorResponse);
      }
  
      const responseData = await response.json();
      console.log("Received response from Gemini API");
      
      // Extract the image data
      console.log("Response data structure:", JSON.stringify(responseData, null, 2).substring(0, 500));
      
      if (responseData.candidates && responseData.candidates.length > 0 &&
          responseData.candidates[0].content && responseData.candidates[0].content.parts) {
        
        for (const part of responseData.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            console.log("Found image data in response");
          } else if (part.text) {
            textResponse = part.text;
          }
        }
      }
    } catch (apiError) {
      console.error("API call error:", apiError);
      errorResponse = (apiError as Error).message || "Error calling Gemini API";
    }

    if (!imageData) {
      console.warn("No image data in Gemini API response, using fallback");
      console.warn("Error details:", errorResponse);
      
      // Use fallback image with Unsplash
      const searchTerms = prompt
        .split(' ')
        .filter((word: string) => word.length > 3)
        .slice(0, 3)
        .join(',');
      
      const unsplashUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms || 'product')}&t=${Date.now()}`;
      
      console.log("Fallback image URL:", unsplashUrl);
      
      return new Response(JSON.stringify({ 
        status: "completed",
        imageUrl: unsplashUrl,
        requestId,
        message: "Using fallback image (Gemini API unavailable)",
        usedFallback: true,
        originalError: errorResponse || "No image data in Gemini API response"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the image data
    console.log("Successfully generated image with Gemini API");
    console.log("Image data length:", imageData.length, "characters");
    
    return new Response(JSON.stringify({ 
      status: "completed",
      imageUrl: `data:image/jpeg;base64,${imageData}`,
      requestId,
      message: textResponse || "Image generated successfully with Gemini 2.0 Flash",
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
    
    // Generate a fallback image URL from Unsplash
    const searchTerms = promptForFallback
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
      .join(',');
    const fallbackImageUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms || 'product')}&t=${Date.now()}`;
    
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
