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
    const SEEDREAM_API_KEY = Deno.env.get('SEEDREAM_API_KEY');
    if (!SEEDREAM_API_KEY) {
      throw new Error('SEEDREAM_API_KEY is not configured');
    }

    const { prompt, productImage, aspectRatio, batchSize } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating image with Seedream 4.0 via BytePlus:', { prompt, aspectRatio, batchSize });

    // Map aspect ratio to BytePlus size parameter
    const sizeMap: Record<string, string> = {
      "1:1": "1024x1024",
      "9:16": "768x1024",
      "16:9": "1024x768",
    };
    const size = sizeMap[aspectRatio || "1:1"] || "1024x1024";

    // Prepare the request body for BytePlus Seedream API
    const seedreamBody: any = {
      model: "seedream-4-0-250828",
      prompt: prompt,
      size: size,
      sequential_image_generation: "disabled",
      response_format: "url",
      stream: false,
      watermark: true,
    };

    // If product image is provided, include it (BytePlus may support image input)
    if (productImage) {
      seedreamBody.image = productImage;
    }

    // Handle batch generation - BytePlus may not support batch in single request
    const batch = batchSize || 1;
    const allImages: string[] = [];

    for (let i = 0; i < batch; i++) {
      console.log(`Generating image ${i + 1} of ${batch}`);
      
      // Call BytePlus Seedream 4.0 API
      const response = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seedreamBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BytePlus Seedream API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate image', 
            details: errorText 
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await response.json();
      console.log('BytePlus Seedream API response:', data);

      // Extract image URL from response (adjust based on actual response structure)
      const imageUrl = data.data?.[0]?.url || data.url || data.image;
      if (imageUrl) {
        allImages.push(imageUrl);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        images: allImages,
        requestId: crypto.randomUUID()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-seedream function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
