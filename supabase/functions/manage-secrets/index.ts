
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
    const { name, value } = await req.json();
    
    if (!name || !value) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Name and value are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Set the environment variable
    Deno.env.set(name, value);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Secret ${name} saved successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in manage-secrets function:', error);
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
