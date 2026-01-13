import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_PROMPT_LENGTH = 2000;
const VALID_PLATFORMS = ['linkedin', 'x', 'blog'];
const VALID_TONES = ['professional', 'conversational', 'inspiring', 'educational', 'authoritative'];
const VALID_LENGTHS = ['short', 'medium', 'long'];

// Input validation function
const validateInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { prompt, platform, tone, length } = data;

  // Validate prompt
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required and must be a string' };
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters` };
  }

  // Validate platform
  if (platform && !VALID_PLATFORMS.includes(platform)) {
    return { valid: false, error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` };
  }

  // Validate tone
  if (tone && !VALID_TONES.includes(tone)) {
    return { valid: false, error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` };
  }

  // Validate length
  if (length && !VALID_LENGTHS.includes(length)) {
    return { valid: false, error: `Invalid length. Must be one of: ${VALID_LENGTHS.join(', ')}` };
  }

  return { valid: true };
};

// Simple fallback content generator when API quota is exceeded
const generateFallbackContent = (platform: string, tone: string, prompt: string) => {
  const safePrompt = prompt.substring(0, 100); // Truncate for safety in templates
  
  const fallbackResponses = {
    linkedin: {
      professional: `🔑 Professional Insight: ${safePrompt}\n\nWhile we continue to evolve in this space, I'd love to hear your thoughts on this topic.\n\nShare your experiences in the comments below!\n\n#ProfessionalDevelopment #IndustryInsights`,
      conversational: `Hey connections! 👋\n\nI've been thinking about ${safePrompt} lately and wanted to start a conversation.\n\nWhat's your take on this? Drop your thoughts below!\n\n#LetsTalk #ProfessionalNetwork`,
      inspiring: `✨ INSPIRATION ALERT ✨\n\n${safePrompt} has incredible potential to transform how we work.\n\nNever stop believing in the power of innovation and continuous learning!\n\n#Inspiration #GrowthMindset`,
      educational: `📚 Learning Corner:\n\nDid you know about the impact of ${safePrompt}?\n\nHere are 3 key takeaways:\n1. It's transforming our industry\n2. Creates new opportunities\n3. Requires adaptive thinking\n\n#AlwaysLearning #KnowledgeSharing`,
      authoritative: `𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡: ${safePrompt} is revolutionizing our industry, and leaders must adapt.\n\nBased on my 10+ years of experience, this will change everything.\n\nAre you prepared?\n\n#ThoughtLeadership #IndustryTrends`
    },
    x: {
      professional: `Key insight: ${safePrompt} is transforming our industry. Thoughts? #ProfessionalDevelopment`,
      conversational: `Just thinking about ${safePrompt}. What's your take on this? #LetsTalk`,
      inspiring: `✨ ${safePrompt} shows how innovation drives progress! Never stop believing in possibilities. #Inspiration`,
      educational: `Did you know about ${safePrompt}? It's creating new opportunities while requiring new skills. #Learning`,
      authoritative: `ATTENTION: ${safePrompt} will change everything. Are you prepared? #ThoughtLeadership`
    }
  };
  
  // Default to professional tone if specified tone isn't available
  const platformResponses = fallbackResponses[platform as keyof typeof fallbackResponses];
  const content = platformResponses?.[tone as keyof typeof platformResponses] || platformResponses?.professional;
  return content;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured on the server' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate if the API key format looks reasonable
    if (!openaiApiKey.startsWith('sk-')) {
      console.error('API key does not appear to be a valid OpenAI key format');
      return new Response(
        JSON.stringify({ error: 'API key does not appear to be a valid OpenAI key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, tone = 'professional', platform = 'linkedin', length = 'medium' } = requestData;
    
    console.log(`Generating ${platform} post with tone: ${tone}, length: ${length}, prompt length: ${prompt.length}`);

    let systemPrompt = '';
    
    if (platform === 'linkedin') {
      systemPrompt = `You are a social media expert who creates engaging posts for LinkedIn. 
      Write a professional ${tone} post with ${length} length about the following topic.
      Include relevant hashtags and format the text with paragraph breaks for readability.`;
    } else if (platform === 'x') {
      systemPrompt = `You are a social media expert who creates engaging posts for X (Twitter). 
      Write a concise ${tone} post that's under 280 characters about the following topic.
      Include 1-2 relevant hashtags.`;
    } else if (platform === 'blog') {
      systemPrompt = `You are a content expert who creates engaging blog posts. 
      Write a ${tone} blog introduction with ${length} length about the following topic.
      Make it engaging and SEO-friendly.`;
    }

    // Check if we should use fallback content
    const useFallback = Deno.env.get('USE_FALLBACK') === 'true';

    if (useFallback) {
      console.log('Using fallback content generator due to API limitations');
      const fallbackText = generateFallbackContent(platform, tone, prompt);
      
      return new Response(
        JSON.stringify({ 
          text: fallbackText,
          isFallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make API request with better error handling
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', response.status);
        
        let errorMessage = 'Failed to generate post with OpenAI API';
        let useFallbackContent = false;
        
        // Extract more specific error information if available
        if (errorData && errorData.error) {
          // Special handling for quota exceeded error
          if (errorData.error.type === 'insufficient_quota' || 
              errorData.error.code === 'insufficient_quota' ||
              (errorData.error.message && errorData.error.message.includes('quota'))) {
            errorMessage = 'API quota exceeded. Using fallback content.';
            useFallbackContent = true;
          }
          else if (errorData.error.type === 'invalid_request_error' && 
              errorData.error.code === 'invalid_api_key') {
            errorMessage = 'Invalid API key';
          } else {
            errorMessage = 'API error occurred';
          }
        }
        
        // If quota is exceeded, use fallback content
        if (useFallbackContent) {
          console.log('API quota exceeded. Using fallback content generator.');
          const fallbackText = generateFallbackContent(platform, tone, prompt);
          
          return new Response(
            JSON.stringify({ 
              text: fallbackText,
              isFallback: true,
              warning: errorMessage
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      
      console.log('Successfully generated post');
      
      return new Response(
        JSON.stringify({ text: generatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error communicating with OpenAI API');
      
      // Use fallback if there's an API error
      console.log('API error. Using fallback content generator.');
      const fallbackText = generateFallbackContent(platform, tone, prompt);
      
      return new Response(
        JSON.stringify({ 
          text: fallbackText,
          isFallback: true,
          warning: 'Error communicating with API. Using fallback content.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('General error in generate-post function');
    return new Response(
      JSON.stringify({ error: 'Server error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
