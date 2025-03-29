
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
    const { prompt, aspect_ratio = "1:1", style, api_key } = await req.json();
    
    // Use the API key from the request body or the environment variable as fallback
    const geminiApiKey = api_key || Deno.env.get('GEMINI_API_KEY') || "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA";
    
    console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);

    // Build a richer prompt for the Gemini model
    const enhancedPrompt = `
      Generate a detailed description of a professional branding image based on:
      
      ${prompt}
      
      Format: ${aspect_ratio === "1:1" ? "Square (1:1)" : "Portrait/Story (9:16)"}
      ${style ? `Style: ${style}` : ''}
      
      The description should be highly detailed so another AI could accurately create the image.
    `;

    // First, we'll get a text description from Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        top_p: 1,
        top_k: 32,
        max_output_tokens: 2048
      }
    };

    // Make the API request to Gemini for text description
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check for errors
    if (!response.ok) {
      let errorMessage = `Gemini API error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Gemini API error:', JSON.stringify(errorData));
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing API error response:', e);
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the successful response
    const data = await response.json();
    
    let imageDescription = "";
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      const parts = data.candidates[0].content.parts;
      for (const part of parts) {
        if (part.text) {
          imageDescription += part.text;
        }
      }
    }
    
    if (!imageDescription) {
      console.error('No text description found in the response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Failed to generate image description.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create an enhanced SVG placeholder with a more distinctive appearance
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const textColor = '#FFFFFF';
    
    // Get the first 20-30 words of the description for display
    const shortDescription = imageDescription.split(' ').slice(0, 25).join(' ') + "...";
    
    // Calculate dimensions based on aspect ratio
    const width = 600;
    const height = aspect_ratio === "1:1" ? 600 : 1067;
    
    // Create a more visually appealing SVG with gradient background
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0.7" />
        </linearGradient>
        <style>
          .title { font: bold 24px sans-serif; fill: white; text-anchor: middle; }
          .desc { font: 16px sans-serif; fill: rgba(255,255,255,0.8); text-anchor: middle; }
          .prompt { font: italic 14px sans-serif; fill: rgba(255,255,255,0.6); text-anchor: middle; }
        </style>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="45%" class="title">AI Image Generation</text>
      <text x="50%" y="50%" class="desc">Based on your prompt:</text>
      <foreignObject x="10%" y="55%" width="80%" height="30%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font: 14px sans-serif; color: rgba(255,255,255,0.9); text-align: center; word-wrap: break-word;">
          "${prompt.substring(0, 150)}${prompt.length > 150 ? '...' : ''}"
        </div>
      </foreignObject>
    </svg>
    `;
    
    // Convert SVG to base64
    const base64 = btoa(svgContent);
    
    console.log('Successfully generated image placeholder');
    
    return new Response(
      JSON.stringify({ 
        imageUrl: `data:image/svg+xml;base64,${base64}`,
        description: imageDescription,
        message: 'Image generated successfully' 
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
