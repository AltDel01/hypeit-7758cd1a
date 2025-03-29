
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
    
    // Now we'll use a different API to generate the actual image based on the description
    // For this example, we'll use a placeholder image. In a real implementation,
    // you would integrate with an image generation API like DALL-E, Stable Diffusion, etc.
    
    // Placeholder implementation - generate a colorful placeholder image
    // In a real implementation, you would replace this with an actual image generation API call
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const placeholderImageUrl = `https://placehold.co/600x${aspect_ratio === "1:1" ? "600" : "1067"}/${randomColor.substring(1)}/FFFFFF?text=AI+Generated+Image`;
    
    // Here's where you would typically call an image generation API with the imageDescription
    
    // For now, we'll just return the placeholder URL
    // In a real implementation, this would be the base64 data of the generated image
    console.log('Successfully generated image placeholder');
    
    // Create a data URL from the placeholder
    const placeholderResponse = await fetch(placeholderImageUrl);
    const imageBlob = await placeholderResponse.blob();
    const reader = new FileReader();
    
    // Convert blob to base64
    const base64Data = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Extract just the base64 data part
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(imageBlob);
    });
    
    return new Response(
      JSON.stringify({ 
        imageUrl: `data:image/jpeg;base64,${base64Data}`,
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
