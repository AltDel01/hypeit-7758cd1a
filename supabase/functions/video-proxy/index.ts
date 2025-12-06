import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Video proxy function - downloads videos from Google's API and serves them to the frontend
 * This handles authentication and CORS issues
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the video URL from query parameters
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');
    const apiKey = url.searchParams.get('key');

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing video URL parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Proxying video request for URL: ${videoUrl.substring(0, 100)}...`);

    // Fetch the video from Google's API
    const headers: HeadersInit = {
      'Accept': 'video/*',
    };

    // Add API key if provided
    if (apiKey) {
      // The URL might already have the key, but adding it again shouldn't hurt
      const fetchUrl = videoUrl.includes('?') 
        ? `${videoUrl}&key=${apiKey}` 
        : `${videoUrl}?key=${apiKey}`;
      
      console.log(`Fetching from: ${fetchUrl.substring(0, 100)}...`);
      
      const response = await fetch(fetchUrl, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Video fetch failed: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch video: ${response.status}`,
            details: errorText
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the video blob
      const videoBlob = await response.blob();
      console.log(`Video fetched successfully, size: ${videoBlob.size} bytes`);

      // Return the video with appropriate headers
      return new Response(videoBlob, {
        headers: {
          ...corsHeaders,
          'Content-Type': videoBlob.type || 'video/mp4',
          'Content-Length': videoBlob.size.toString(),
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } else {
      // Try without API key (might work if URL is already authenticated)
      console.log(`Fetching from: ${videoUrl.substring(0, 100)}...`);
      
      const response = await fetch(videoUrl, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Video fetch failed: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch video: ${response.status}`,
            details: errorText
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the video blob
      const videoBlob = await response.blob();
      console.log(`Video fetched successfully, size: ${videoBlob.size} bytes`);

      // Return the video with appropriate headers
      return new Response(videoBlob, {
        headers: {
          ...corsHeaders,
          'Content-Type': videoBlob.type || 'video/mp4',
          'Content-Length': videoBlob.size.toString(),
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    }
  } catch (error) {
    console.error('Video proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
