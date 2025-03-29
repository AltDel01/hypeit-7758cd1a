
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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured on the server' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, aspect_ratio = "1:1", style } = await req.json();
    
    console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Create a professional branding image with the following description: ${prompt}
                ${style ? `Style: ${style}` : ''}
                Make it suitable for Instagram ${aspect_ratio === "1:1" ? "feed" : "story"} with ${aspect_ratio} aspect ratio.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        top_p: 1,
        top_k: 32,
        max_output_tokens: 2048,
        response_mime_type: "image/jpeg"
      }
    };

    // Make the API request
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
    
    // Extract the image from the response
    let imageData = null;
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      const parts = data.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          imageData = part.inlineData.data; // This is the base64 data
          break;
        }
      }
    }
    
    if (!imageData) {
      console.error('No image found in the response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Failed to generate image. No image data in the response.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Successfully generated image');
    
    return new Response(
      JSON.stringify({ 
        imageUrl: `data:image/jpeg;base64,${imageData}`,
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
