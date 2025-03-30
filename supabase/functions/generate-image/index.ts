
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
    const { prompt, aspect_ratio = "1:1", style } = await req.json();
    
    console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);

    // Now we'll forward this request to the webhook URL
    const webhookUrl = "https://hook.us2.make.com/yi8ng2m5p82cduxohbugpqaarphi5ofu";
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio,
        style
      })
    });
    
    // First check if the response is OK
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Error from webhook:", errorText);
      return new Response(
        JSON.stringify({ error: `Webhook error: ${webhookResponse.statusText}` }),
        { status: webhookResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the response as text first
    const responseText = await webhookResponse.text();
    let responseData;
    
    // If the response is "Accepted", create a placeholder response
    if (responseText === "Accepted") {
      console.log("Successfully generated image placeholder");
      responseData = { 
        status: "accepted",
        message: "Image generation request accepted",
        imageUrl: "https://via.placeholder.com/600x600?text=Generating+Image..."
      };
    } else {
      // Try to parse as JSON
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        // If parsing fails, use the text as error
        console.error("Failed to parse webhook response as JSON:", error);
        responseData = { error: `Failed to parse response: ${responseText}` };
      }
    }
    
    return new Response(
      JSON.stringify(responseData),
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
