
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
    const { action, key } = await req.json();
    
    if (action === 'set' && key) {
      // Let's validate the key by making a test request to the Gemini API
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        
        const testResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
          })
        });
        
        const responseData = await testResponse.json();
        
        if (!testResponse.ok) {
          console.error('API key validation failed:', responseData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: responseData.error?.message || 'Invalid API key' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Key is valid, let's save it as an environment variable
        const supabaseClient = Deno.env.get('SUPABASE_CLIENT');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseKey) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Supabase configuration is missing on the server' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Save the key in Supabase
        // We could use the Supabase client but for simplicity we'll use fetch
        const secretsUrl = `${supabaseUrl}/functions/v1/manage-secrets`;
        const secretsResponse = await fetch(secretsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            name: 'GEMINI_API_KEY',
            value: key
          })
        });
        
        if (!secretsResponse.ok) {
          console.error('Failed to save API key:', await secretsResponse.text());
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Failed to save API key' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'API key configured successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error validating Gemini API key:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Failed to validate API key: ${error.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else if (action === 'check') {
      // Check if the key is configured
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      return new Response(
        JSON.stringify({ 
          success: !!geminiApiKey,
          message: geminiApiKey ? 'API key is configured' : 'API key is not configured' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid action. Use "set" or "check".' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in test-gemini-key function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Server error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
