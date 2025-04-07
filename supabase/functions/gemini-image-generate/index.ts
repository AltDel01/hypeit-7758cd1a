
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
    const { prompt, product_image } = requestData;

    if (!prompt) {
      console.error("Prompt is required");
      throw new Error("Prompt is required");
    }

    // Prepare the request to Gemini API
    const genaiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";
    
    // Build the request body
    const requestBody: any = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
          ],
        },
      ],
      response_modalities: ["image", "text"],
      response_mime_type: "text/plain",
    };

    // Add product image if provided
    if (product_image) {
      try {
        console.log("Product image provided, adding to request");
        
        requestBody.contents[0].parts.push({
          inline_data: {
            mime_type: product_image.startsWith("data:image/") ? 
              product_image.split(';')[0].split(':')[1] : 
              "image/jpeg",
            data: product_image.includes("base64,") ? 
              product_image.split("base64,")[1] : 
              product_image
          }
        });
        
        console.log("Product image added to request");
      } catch (imageError) {
        console.error("Error processing product image:", imageError);
      }
    }

    console.log("Sending request to Gemini API with prompt:", prompt);
    
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
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      } catch (e) {
        // If parsing fails, use the raw error text
        throw new Error(`Gemini API error: Status ${response.status} - ${errorText || response.statusText}`);
      }
    }

    const responseData = await response.json();
    console.log("Received response from Gemini API");
    
    // Extract the image data
    let imageData = null;
    let textResponse = null;
    
    if (responseData.candidates && responseData.candidates.length > 0 &&
        responseData.candidates[0].content && responseData.candidates[0].content.parts) {
      
      for (const part of responseData.candidates[0].content.parts) {
        if (part.inline_data) {
          imageData = part.inline_data.data;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      console.error("No image data in response:", JSON.stringify(responseData));
      
      // Use fallback image with Unsplash
      const searchTerms = prompt
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(',');
      
      const unsplashUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms || 'product')}`;
      
      return new Response(JSON.stringify({ 
        status: "completed",
        imageUrl: unsplashUrl,
        message: "Using fallback image source due to API error",
        error: "No image data in Gemini API response"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the image data
    return new Response(JSON.stringify({ 
      status: "completed",
      imageUrl: `data:image/jpeg;base64,${imageData}`,
      message: textResponse || "Image generated successfully",
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in gemini-image-generate function:", error);
    
    // Generate a fallback image URL from Unsplash based on the error
    const fallbackImageUrl = `https://source.unsplash.com/featured/800x800/?product&error=${Date.now()}`;
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        imageUrl: fallbackImageUrl,  // Always provide an image URL, even in case of errors
        message: "Using fallback image due to error",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
