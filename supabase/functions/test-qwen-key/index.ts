
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
    const { key } = await req.json();
    
    // For development purposes only!
    // In production, you should set this in the Supabase dashboard
    // This is just a temporary solution for testing
    
    // Test the key with a simple request to Qwen API
    const response = await fetch('https://api.qwen.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    if (!response.ok) {
      console.error('Invalid Qwen API key');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Here you would normally use Deno.env.set but that doesn't persist between invocations
    // In a real scenario, you'd set this in the Supabase dashboard
    console.log('Valid Qwen API key received');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-qwen-key function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
