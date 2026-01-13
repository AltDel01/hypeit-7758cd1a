import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_PROMPT_LENGTH = 2000;
const VALID_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const MAX_IMAGE_SIZE = 10000000; // ~7.5MB in base64

// Input validation function
const validateInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { prompt, product_image, aspect_ratio } = data;

  // Validate prompt
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required and must be a string' };
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters` };
  }

  // Validate aspect ratio
  if (aspect_ratio && !VALID_ASPECT_RATIOS.includes(aspect_ratio)) {
    return { valid: false, error: `Invalid aspect ratio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` };
  }

  // Validate product image if provided
  if (product_image) {
    if (typeof product_image !== 'string') {
      return { valid: false, error: 'Product image must be a string (base64 or data URL)' };
    }

    if (product_image.length > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Product image is too large (max ~7.5MB)' };
    }

    // Basic validation for base64/data URL format
    const isDataUrl = product_image.startsWith('data:image/');
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(product_image.substring(0, 100));
    
    if (!isDataUrl && !isBase64) {
      return { valid: false, error: 'Product image must be a valid base64 string or data URL' };
    }
  }

  return { valid: true };
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
      throw new Error("API key not configured");
    }

    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      prompt,
      product_image,
      aspect_ratio = "1:1",
    } = requestData;

    console.log(
      `Image generation request received. Prompt length: ${prompt.length}, Has product image: ${!!product_image}, Aspect ratio: ${aspect_ratio}`,
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
        console.error("Gemini API error:", response.status);
        
        // Generic error message for clients
        errorResponse = "Image generation service temporarily unavailable";
        throw new Error(errorResponse);
      }
  
      const responseData = await response.json();
      console.log("Received response from Gemini 2.5 Flash Image");
      
      // ========= 3) Extract the generated image (inline_data) =========
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
        }
      }
    } catch (apiError) {
      console.error("API call error");
      errorResponse = "Image generation service error";
    }

    // ========= 4) Fallback logic if no image returned =========
    if (!imageData) {
      console.warn("No image data in Gemini API response, using fallback");
      
      const seed = Math.abs(
        prompt.split("").reduce((a: number, b: string) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0),
      );

      const fallbackUrl = `https://picsum.photos/seed/${seed}/800/800.jpg`;

      console.log("Fallback image URL generated");

      return new Response(
        JSON.stringify({
          status: "completed",
          imageUrl: fallbackUrl,
          requestId,
          message: "Using fallback image",
          usedFallback: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========= 5) Success response =========
    console.log("Successfully generated image with Gemini 2.5 Flash Image");

    const mime = imageMime || "image/png";

    return new Response(
      JSON.stringify({
        status: "completed",
        imageUrl: `data:${mime};base64,${imageData}`,
        requestId,
        message: "Image generated successfully",
        usedFallback: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  } catch (error) {
    console.error("Error in gemini-image-generate function");

    let promptForFallback = "product";
    try {
      const errorRequestData = await req.clone().json();
      if (errorRequestData.prompt) {
        promptForFallback = errorRequestData.prompt.substring(0, 100);
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

    console.log("Returning fallback image due to error");

    return new Response(
      JSON.stringify({
        status: "completed",
        imageUrl: fallbackImageUrl,
        requestId: crypto.randomUUID(),
        message: "Using fallback image",
        usedFallback: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
