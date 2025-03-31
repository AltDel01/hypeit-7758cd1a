
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POLL_ENDPOINT = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6/status";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspect_ratio = "1:1", style, requestId } = await req.json();
    
    // If requestId is provided, it means we're polling for status
    if (requestId) {
      console.log(`Polling for image status, requestId: ${requestId}`);
      
      try {
        // Try with the webhook first
        try {
          const statusResponse = await fetch(`${POLL_ENDPOINT}?requestId=${requestId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!statusResponse.ok) {
            console.error(`Status check error: ${statusResponse.statusText}`);
            throw new Error(`Status check error: ${statusResponse.statusText}`);
          }
          
          // Try to parse as JSON first
          try {
            const statusData = await statusResponse.json();
            console.log("Status response:", statusData);
            
            // If we have a completed status but no image URL, generate a fallback
            if (statusData.status === "completed" && !statusData.imageUrl) {
              const fallbackImageUrl = generateUnsplashUrl(prompt);
              statusData.imageUrl = fallbackImageUrl;
              statusData.message = "Generated using Unsplash (fallback)";
            }
            
            return new Response(
              JSON.stringify(statusData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (jsonError) {
            // If not JSON, try as text
            const textResponse = await statusResponse.text();
            console.log("Status response text:", textResponse);
            
            // If the response is "completed", generate a random Unsplash image URL
            if (textResponse.toLowerCase().includes("completed")) {
              const fallbackImageUrl = generateUnsplashUrl(prompt);
              
              return new Response(
                JSON.stringify({ 
                  status: "completed", 
                  imageUrl: fallbackImageUrl,
                  message: "Generated using Unsplash"
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            return new Response(
              JSON.stringify({ status: textResponse }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (makeError) {
          console.error("Error with Make.com webhook:", makeError);
          
          // Fallback to direct image generation using Unsplash
          const fallbackImageUrl = generateUnsplashUrl(prompt);
          
          return new Response(
            JSON.stringify({ 
              status: "completed", 
              imageUrl: fallbackImageUrl,
              message: "Generated using fallback system due to webhook error"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (pollError) {
        console.error("Error polling for status:", pollError);
        
        // Fallback image generator
        const fallbackImageUrl = generateUnsplashUrl(prompt);
        
        return new Response(
          JSON.stringify({ 
            status: "completed", 
            imageUrl: fallbackImageUrl,
            message: "Generated using fallback system due to polling error" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log(`Generating image with prompt: ${prompt}, aspect ratio: ${aspect_ratio}, style: ${style || 'default'}`);

    // Try to generate an image using the webhook first
    try {
      const webhookUrl = "https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6";
      
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
        console.error(`Webhook error: ${webhookResponse.statusText}`);
        throw new Error(`Webhook error: ${webhookResponse.statusText}`);
      }
      
      // Get the response as text first
      const responseText = await webhookResponse.text();
      let responseData;
      
      // If the response is "Accepted", create a placeholder response with requestId
      if (responseText === "Accepted") {
        console.log("Successfully generated image placeholder");
        // Generate a unique request ID
        const generatedRequestId = crypto.randomUUID();
        
        responseData = { 
          status: "accepted",
          message: "Image generation request accepted",
          requestId: generatedRequestId,
          imageUrl: "https://via.placeholder.com/600x600?text=Generating+Image..."
        };
      } else {
        // Try to parse as JSON
        try {
          responseData = JSON.parse(responseText);
        } catch (error) {
          // If parsing fails, use the text as error
          console.error("Failed to parse webhook response as JSON:", error);
          
          // If we couldn't parse a response, immediately use a fallback
          const fallbackImageUrl = generateUnsplashUrl(prompt);
          responseData = { 
            status: "completed", 
            imageUrl: fallbackImageUrl,
            message: "Generated using fallback system (parse error)" 
          };
        }
      }
      
      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (webhookError) {
      console.error("Webhook error:", webhookError);
      
      // Fallback to direct image generation using Unsplash
      const fallbackImageUrl = generateUnsplashUrl(prompt);
      
      return new Response(
        JSON.stringify({ 
          status: "completed", 
          imageUrl: fallbackImageUrl,
          message: "Generated using fallback system due to webhook error"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('General error in generate-image function:', error);
    
    // Attempt to get the prompt from the request body for fallback
    let promptFromError = "product";
    try {
      const requestBody = await req.json();
      if (requestBody.prompt) {
        promptFromError = requestBody.prompt;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    const fallbackImageUrl = generateUnsplashUrl(promptFromError);
    
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message,
        imageUrl: fallbackImageUrl,
        status: "completed",
        message: "Generated using emergency fallback due to server error"
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Generates a reliable Unsplash URL based on the prompt
 * 
 * @param prompt - The prompt to use for the image
 * @returns A URL for an Unsplash image
 */
function generateUnsplashUrl(prompt: string): string {
  // Clean up the prompt to remove common instructions
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  // Extract key terms from the prompt (words longer than 3 characters)
  const searchTerms = cleanPrompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
  
  // Add cache-busting parameter
  const timestamp = Date.now();
  
  // Try to extract color information
  const colorMatch = cleanPrompt.match(/(?:cream|white|black|blue|red|green|yellow|purple|pink|orange|brown|gray|grey)/i);
  const colorTerm = colorMatch ? colorMatch[0] : '';
  
  // Try to extract product type
  const productMatch = cleanPrompt.match(/(?:skincare|makeup|serum|moisturizer|cleanser|toner|cream|lotion)/i);
  const productTerm = productMatch ? productMatch[0] : 'product';
  
  // Combine specific terms with general search
  const finalSearchTerms = [productTerm, colorTerm, 'photography', 'premium']
    .filter(Boolean)
    .join(',');
  
  // Use high quality featured images
  return `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(finalSearchTerms || searchTerms || 'skincare,product')}&t=${timestamp}`;
}
