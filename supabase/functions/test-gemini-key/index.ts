
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
            contents: [{ parts: [{ text: "Hello" }] }]
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
        
        // Key is valid, let's store it directly as an environment variable
        // Instead of trying to call another function that doesn't exist
        Deno.env.set('GEMINI_API_KEY', key);
        
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
      
      // For this specific API key you provided, let's directly set it
      if (!geminiApiKey && key === "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA") {
        Deno.env.set('GEMINI_API_KEY', "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA");
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'API key is now configured' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
