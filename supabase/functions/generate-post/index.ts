
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured on the server' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate if the API key format looks like an OpenAI key (they typically start with "sk-")
    if (!openaiApiKey.startsWith('sk-')) {
      console.error('OPENAI_API_KEY does not appear to be a valid OpenAI key format');
      return new Response(
        JSON.stringify({ error: 'API key does not appear to be a valid OpenAI key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, tone, platform, length } = await req.json();
    
    console.log(`Generating ${platform} post with tone: ${tone}, length: ${length || 'default'}, prompt: ${prompt}`);

    let systemPrompt = '';
    
    if (platform === 'linkedin') {
      systemPrompt = `You are a social media expert who creates engaging posts for LinkedIn. 
      Write a professional ${tone} post with ${length || 'medium'} length about the following topic.
      Include relevant hashtags and format the text with paragraph breaks for readability.`;
    } else if (platform === 'x') {
      systemPrompt = `You are a social media expert who creates engaging posts for X (Twitter). 
      Write a concise ${tone} post that's under 280 characters about the following topic.
      Include 1-2 relevant hashtags.`;
    }

    // Make API request with better error handling
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', response.status, JSON.stringify(errorData));
        
        let errorMessage = 'Failed to generate post with OpenAI API';
        
        // Extract more specific error information if available
        if (errorData && errorData.error) {
          // Special handling for quota exceeded error
          if (errorData.error.type === 'insufficient_quota' || 
              errorData.error.code === 'insufficient_quota' ||
              (errorData.error.message && errorData.error.message.includes('quota'))) {
            errorMessage = 'Your OpenAI API key has exceeded its quota. Please check your billing details or use a different API key.';
          }
          else if (errorData.error.type === 'invalid_request_error' && 
              errorData.error.code === 'invalid_api_key') {
            errorMessage = 'Invalid OpenAI API key provided';
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      
      console.log('Successfully generated post');
      
      return new Response(
        JSON.stringify({ text: generatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error communicating with OpenAI API:', apiError);
      return new Response(
        JSON.stringify({ error: 'Error communicating with OpenAI API', details: apiError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('General error in generate-post function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
