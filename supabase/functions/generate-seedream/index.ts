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

    console.log('Generating image with Seedream 4.0:', { prompt, aspectRatio, batchSize });

    // Prepare the request body for Seedream API
    const seedreamBody: any = {
      prompt: prompt,
      num_images: batchSize || 1,
      aspect_ratio: aspectRatio || "1:1",
    };

    // If product image is provided, include it
    if (productImage) {
      seedreamBody.image = productImage;
    }

    // Call Seedream 4.0 API
    const response = await fetch('https://api.seedream.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seedreamBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Seedream API error:', response.status, errorText);
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
    console.log('Seedream API response:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        images: data.images || [data.image],
        requestId: data.id || crypto.randomUUID()
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
