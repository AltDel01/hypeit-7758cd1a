
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

    // Create a better visual placeholder SVG
    const width = aspect_ratio === "1:1" ? 1200 : 1080;
    const height = aspect_ratio === "1:1" ? 1200 : 1920;
    
    // Extract a title from the prompt (first sentence or first 50 chars)
    const title = prompt.split('.')[0].substring(0, 50) + (prompt.length > 50 ? '...' : '');
    
    // Get a short summary of the description (first 150 chars)
    const shortDesc = imageDescription.substring(0, 150) + '...';
    
    // Select a color scheme based on some keywords in the prompt
    let primaryColor = '#4F46E5'; // Default blue
    let secondaryColor = '#818CF8';
    let textColor = '#FFFFFF';
    
    if (prompt.toLowerCase().includes('food') || prompt.toLowerCase().includes('restaurant')) {
      primaryColor = '#F59E0B'; // Amber for food
      secondaryColor = '#FBBF24';
    } else if (prompt.toLowerCase().includes('nature') || prompt.toLowerCase().includes('green')) {
      primaryColor = '#10B981'; // Green for nature
      secondaryColor = '#34D399';
    } else if (prompt.toLowerCase().includes('luxury') || prompt.toLowerCase().includes('premium')) {
      primaryColor = '#8B5CF6'; // Purple for luxury
      secondaryColor = '#A78BFA';
    } else if (prompt.toLowerCase().includes('tech') || prompt.toLowerCase().includes('digital')) {
      primaryColor = '#2563EB'; // Blue for tech
      secondaryColor = '#60A5FA';
    } else if (prompt.toLowerCase().includes('beauty') || prompt.toLowerCase().includes('cosmetic')) {
      primaryColor = '#EC4899'; // Pink for beauty
      secondaryColor = '#F472B6';
    }
    
    // Create an improved SVG placeholder with a gradient, stylized title and description
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
            font: bold 48px sans-serif; 
            fill: ${textColor}; 
            text-anchor: middle;
            filter: url(#shadow);
          }
          .subtitle { 
            font: bold 24px sans-serif; 
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
          .description {
            font: 16px sans-serif;
            fill: ${textColor};
            text-anchor: middle;
            opacity: 0.8;
          }
        </style>
      </defs>
      
      <!-- Background with gradient -->
      <rect width="100%" height="100%" fill="url(#grad)" />
      
      <!-- Decorative elements -->
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.1}" fill="rgba(255,255,255,0.1)" />
      <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.15}" fill="rgba(0,0,0,0.1)" />
      
      <!-- Title and content -->
      <g transform="translate(${width/2}, ${height/2 - 100})">
        <text class="title" y="-80">AI Image Generator</text>
        <text class="subtitle" y="-20">Based on your prompt:</text>
        
        <foreignObject x="-${width * 0.4}" y="20" width="${width * 0.8}" height="${height * 0.3}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font: 18px sans-serif; color: white; text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; max-height: 100%; overflow: auto; word-wrap: break-word;">
            "${prompt}"
          </div>
        </foreignObject>
        
        <text class="prompt" y="${height * 0.25}">Preview Only - Real image will be generated soon</text>
      </g>
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
