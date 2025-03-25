
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
    const { key, action } = await req.json();
    
    // Just check if the key is configured
    if (action === 'check') {
      if (!qwenApiKey) {
        console.log('QWEN_API_KEY is not set in environment variables');
        return new Response(
          JSON.stringify({ success: false, error: 'API key not configured' }),
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
        // Test the key with a simple request to Qwen API
        const response = await fetch('https://api.qwen.ai/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${key}`
          }
        });

        if (!response.ok) {
          console.error('Invalid Qwen API key provided');
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid API key' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Valid Qwen API key received');
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error testing Qwen API key:', error);
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
    console.error('Error in test-qwen-key function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
