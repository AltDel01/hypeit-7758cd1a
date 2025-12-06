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
    // Parse the request - can be query parameters or JSON body
    let videoUrl: string | null = null;
    let apiKey: string | null = null;

    if (req.method === 'GET') {
      // Get from query parameters
      const url = new URL(req.url);
      videoUrl = url.searchParams.get('url');
      apiKey = url.searchParams.get('key');
    } else if (req.method === 'POST') {
      // Get from JSON body
      try {
        const body = await req.json();
        videoUrl = body.url;
        apiKey = body.key;
      } catch {
        // Fall back to query parameters
        const url = new URL(req.url);
        videoUrl = url.searchParams.get('url');
        apiKey = url.searchParams.get('key');
      }
    }

    if (!videoUrl) {
      console.error('Missing video URL parameter');
      return new Response(
        JSON.stringify({ error: 'Missing video URL parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Proxying video request for URL: ${videoUrl.substring(0, 100)}...`);

    // For Google's file download endpoint, we need to append the API key as a query parameter
    // The x-goog-api-key header doesn't work for file downloads, only for API requests
    let fetchUrl = videoUrl;
    if (apiKey) {
      // Add the API key as a query parameter
      fetchUrl = videoUrl.includes('?') 
        ? `${videoUrl}&key=${apiKey}` 
        : `${videoUrl}?key=${apiKey}`;
    }
    
    console.log(`Fetching from: ${fetchUrl.substring(0, 150)}...`);
    
    const fetchHeaders: HeadersInit = {
      'Accept': 'video/*',
    };
    
    const response = await fetch(fetchUrl, { headers: fetchHeaders });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`Video fetch failed: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch video: ${response.status}`,
          details: errorText
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the video data as ArrayBuffer
    const videoBuffer = await response.arrayBuffer();
    console.log(`Video fetched successfully, size: ${videoBuffer.byteLength} bytes`);

    // Return the video binary data with appropriate headers
    return new Response(videoBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
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
