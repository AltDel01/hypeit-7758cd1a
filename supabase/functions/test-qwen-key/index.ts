
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
    const { key, action } = await req.json();
    
    // Just check if the key is configured
    if (action === 'check') {
      if (!openaiApiKey) {
        console.log('OPENAI_API_KEY is not set in environment variables');
        return new Response(
          JSON.stringify({ success: false, error: 'API key not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Basic format validation
      if (!openaiApiKey.startsWith('sk-')) {
        console.log('OPENAI_API_KEY does not appear to be a valid OpenAI key format');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'API key does not appear to be a valid OpenAI key format. OpenAI keys typically start with "sk-"' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Test a provided key
    if (key) {
      try {
        // Validate format
        if (!key.startsWith('sk-')) {
          console.error('Provided key does not appear to be a valid OpenAI key format');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Key does not appear to be a valid OpenAI key format. OpenAI keys typically start with "sk-"' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Test the key with a simple request to OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${key}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Invalid OpenAI API key provided:', errorData);
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid API key' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Valid OpenAI API key received');
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error testing OpenAI API key:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Error testing API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-openai-key function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
