
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
    const { prompt, aspect_ratio = "1:1", style, request_id } = await req.json();
    
    // Get the OpenAI API key from Supabase environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${request_id}] Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);

    // Prepare the request for OpenAI's DALL-E model
    const size = aspect_ratio === "1:1" ? "1024x1024" : "1024x1792";
    const enhancedPrompt = style ? `${prompt} Style: ${style}` : prompt;
    
    // Call OpenAI's DALL-E API
    const openAIResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: "standard",
        response_format: "url"
      })
    });

    // Check for errors in the OpenAI response
    if (!openAIResponse.ok) {
      let errorMessage = `OpenAI API error: ${openAIResponse.status}`;
      try {
        const errorData = await openAIResponse.json();
        console.error(`[${request_id}] OpenAI API error:`, JSON.stringify(errorData));
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error;
        }
      } catch (e) {
        console.error(`[${request_id}] Error parsing API error response:`, e);
      }
      
      // If API call fails, generate a nice placeholder SVG
      return createPlaceholderResponse(prompt, aspect_ratio, errorMessage, request_id, corsHeaders);
    }

    // Process the successful response
    const data = await openAIResponse.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error(`[${request_id}] No image URL in the OpenAI response:`, JSON.stringify(data));
      return createPlaceholderResponse(prompt, aspect_ratio, "Failed to generate image from OpenAI", request_id, corsHeaders);
    }

    const imageUrl = data.data[0].url;
    console.log(`[${request_id}] Successfully generated image from OpenAI: ${imageUrl}`);
    
    return new Response(
      JSON.stringify({ 
        imageUrl,
        message: 'Image generated successfully',
        revised_prompt: data.data[0].revised_prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('General error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create a placeholder SVG response when image generation fails
function createPlaceholderResponse(prompt: string, aspect_ratio: string, errorMessage: string, request_id: string, corsHeaders: any) {
  console.log(`[${request_id}] Creating placeholder SVG with error message: ${errorMessage}`);
  
  const width = aspect_ratio === "1:1" ? 1024 : 1024;
  const height = aspect_ratio === "1:1" ? 1024 : 1792;
  
  // Extract a title from the prompt (first sentence or first 50 chars)
  const title = prompt.split('.')[0].substring(0, 50) + (prompt.length > 50 ? '...' : '');
  
  // Select colors based on the error for visual feedback
  const primaryColor = '#FF5757'; // Error red
  const secondaryColor = '#FF8A8A';
  const textColor = '#FFFFFF';
  
  // Create an improved SVG placeholder with error information
  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.8" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="20" />
        <feOffset dx="0" dy="0" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.5" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <style>
        .title { 
          font: bold 36px sans-serif; 
          fill: ${textColor}; 
          text-anchor: middle;
          filter: url(#shadow);
        }
        .error-title { 
          font: bold 28px sans-serif; 
          fill: ${textColor}; 
          text-anchor: middle;
          filter: url(#shadow);
        }
        .error-message { 
          font: 20px sans-serif; 
          fill: ${textColor}; 
          text-anchor: middle;
          opacity: 0.9;
        }
        .prompt { 
          font: 18px sans-serif; 
          fill: ${textColor}; 
          text-anchor: middle;
          opacity: 0.7;
        }
      </style>
    </defs>
    
    <!-- Background with gradient -->
    <rect width="100%" height="100%" fill="url(#grad)" />
    
    <!-- Decorative elements -->
    <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.1}" fill="rgba(255,255,255,0.1)" />
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.15}" fill="rgba(0,0,0,0.1)" />
    
    <!-- Title and content -->
    <g transform="translate(${width/2}, ${height/2 - 150})">
      <text class="title" y="-80">Image Generation Error</text>
      <text class="error-title" y="0">Error Message:</text>
      
      <foreignObject x="-${width * 0.4}" y="40" width="${width * 0.8}" height="${height * 0.2}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font: 18px sans-serif; color: white; text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; max-height: 100%; overflow: auto; word-wrap: break-word;">
          "${errorMessage}"
        </div>
      </foreignObject>
      
      <text class="prompt" y="${height * 0.15}">Your Prompt:</text>
      <foreignObject x="-${width * 0.4}" y="${height * 0.15 + 20}" width="${width * 0.8}" height="${height * 0.15}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font: 16px sans-serif; color: white; text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 10px; max-height: 100%; overflow: auto; word-wrap: break-word;">
          "${prompt}"
        </div>
      </foreignObject>
      
      <text class="prompt" y="${height * 0.3}" style="font-style: italic;">Please try again or revise your prompt</text>
    </g>
  </svg>
  `;
  
  // Convert SVG to base64
  const base64 = btoa(unescape(encodeURIComponent(svgContent)));
  
  console.log(`[${request_id}] Successfully generated error placeholder`);
  
  return new Response(
    JSON.stringify({ 
      imageUrl: `data:image/svg+xml;base64,${base64}`,
      error: errorMessage,
      message: 'Failed to generate image' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
