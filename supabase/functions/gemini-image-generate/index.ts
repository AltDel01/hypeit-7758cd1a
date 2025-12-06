
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not set");
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const requestData = await req.json();
    const {
      prompt,
      product_image,
      aspect_ratio = "1:1",
    } = requestData;

    if (!prompt) {
      console.error("Prompt is required");
      throw new Error("Prompt is required");
    }

    console.log(
      `Image generation request received. Prompt: "${prompt?.substring(0, 30)}...", Has product image: ${!!product_image}, Aspect ratio: ${aspect_ratio}`,
    );

    const requestId = crypto.randomUUID();
    console.log(`Assigned request ID: ${requestId}`);

    // ========= 1) Build contents.parts for Gemini 2.5 Flash Image =========
    const parts: any[] = [{ text: prompt }];

    if (product_image) {
      // Accept either raw base64 or data URL
      let base64Data = product_image as string;
      const dataUrlMatch = base64Data.match(/^data:(.+);base64,(.*)$/);

      let mimeType = "image/jpeg";
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      }

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });

      console.log("Attached product image as inline_data for Gemini 2.5 Flash Image");
    }

    // ========= 2) Build request body for Gemini 2.5 Flash Image =========
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

    const requestBody: any = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      // Optional: only images & aspect ratio
      generationConfig: {
        responseModalities: ["IMAGE"], // "IMAGE" only (no text)
        imageConfig: {
          aspectRatio: aspect_ratio || "1:1", // "1:1", "3:4", "4:3", "9:16", "16:9"
        },
      },
    };

    console.log("Sending request to Gemini 2.5 Flash Image");
    console.log(`Using aspect ratio: ${aspect_ratio}`);
    console.log("Request body (truncated):", JSON.stringify(requestBody, null, 2).substring(0, 800));
    
    let imageData: string | null = null;
    let imageMime: string | null = null;
    let errorResponse: string | null = null;
    
    try {
      // Call Gemini 2.5 Flash Image API
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
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
        } catch (_e) {
          // If parsing fails, use the raw error text
          errorResponse = `Gemini API error: Status ${response.status} - ${errorText || response.statusText}`;
        }
        
        throw new Error(errorResponse);
      }
  
      const responseData = await response.json();
      console.log("Received response from Gemini 2.5 Flash Image");
      
      // ========= 3) Extract the generated image (inline_data) =========
      // Shape: { candidates: [ { content: { parts: [ {inline_data: {...}}, {text: ...} ] } } ] }
      console.log("Response data (truncated):", JSON.stringify(responseData, null, 2).substring(0, 800));
      
      const candidates = responseData.candidates || [];
      if (candidates.length > 0) {
        const content = candidates[0].content || {};
        const partsOut = content.parts || [];

        const imagePart = partsOut.find(
          (p: any) => p.inline_data && p.inline_data.data,
        );

        if (imagePart) {
          imageData = imagePart.inline_data.data;
          imageMime = imagePart.inline_data.mime_type || "image/png";
          console.log("Found generated image in inline_data");
          console.log("MIME type:", imageMime);
        }
      }
    } catch (apiError) {
      console.error("API call error:", apiError);
      errorResponse = (apiError as Error).message || "Error calling Gemini API";
    }

    // ========= 4) Fallback logic if no image returned =========
    if (!imageData) {
      console.warn("No image data in Gemini API response, using fallback");
      console.warn("Error details:", errorResponse);
      
      const seed = Math.abs(
        prompt.split("").reduce((a: number, b: string) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0),
      );

      const fallbackUrl = `https://picsum.photos/seed/${seed}/800/800.jpg`;

      console.log("Fallback image URL:", fallbackUrl);

      return new Response(
        JSON.stringify({
          status: "completed",
          imageUrl: fallbackUrl,
          requestId,
          message: "Using fallback image (Gemini API unavailable or no image)",
          usedFallback: true,
          originalError: errorResponse || "No image data in Gemini API response",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========= 5) Success response =========
    console.log("Successfully generated image with Gemini 2.5 Flash Image");
    console.log("Image data length:", imageData.length, "characters");

    const mime = imageMime || "image/png";

    return new Response(
      JSON.stringify({
        status: "completed",
        imageUrl: `data:${mime};base64,${imageData}`,
        requestId,
        message: "Image generated successfully with Gemini 2.5 Flash Image",
        usedFallback: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  } catch (error) {
    console.error("Error in gemini-image-generate function:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    let promptForFallback = "product";
    try {
      const errorRequestData = await req.clone().json();
      if (errorRequestData.prompt) {
        promptForFallback = errorRequestData.prompt;
      }
    } catch (_e) {
      // ignore
    }

    const seed = Math.abs(
      promptForFallback.split("").reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0),
    );
    const fallbackImageUrl = `https://picsum.photos/seed/${seed}/800/800.jpg`;

    console.log("Returning fallback image due to error:", fallbackImageUrl);

    return new Response(
      JSON.stringify({
        status: "completed",
        imageUrl: fallbackImageUrl,
        requestId: crypto.randomUUID(),
        message: "Using fallback image due to error",
        usedFallback: true,
        originalError: error instanceof Error ? error.message : String(error),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
