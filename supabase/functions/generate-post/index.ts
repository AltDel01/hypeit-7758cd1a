
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
    const qwenApiKey = Deno.env.get('QWEN_API_KEY');
    
    if (!qwenApiKey) {
      console.error('QWEN_API_KEY is not set in the environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, tone, platform, length } = await req.json();
    
    console.log(`Generating ${platform} post with tone: ${tone}, length: ${length || 'default'}`);

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

    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenApiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-max',
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
      const errorData = await response.text();
      console.error('Qwen API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate post', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    console.log('Successfully generated post');
    
    return new Response(
      JSON.stringify({ text: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-post function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
