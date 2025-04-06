
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
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const requestData = await req.json();
    const { prompt, productImage } = requestData;

    if (!prompt) {
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
    if (productImage) {
      try {
        // Decode base64 image
        const imageData = base64Decode(productImage);
        
        // Add to request
        requestBody.contents[0].parts.push({
          inline_data: {
            mime_type: "image/jpeg", // Assuming JPEG format, adjust if needed
            data: productImage
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
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
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
      throw new Error("No image data in response");
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
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to decode base64
function base64Decode(base64String: string): Uint8Array {
  const binary = atob(base64String);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
