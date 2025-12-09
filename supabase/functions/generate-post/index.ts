
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple fallback content generator when API quota is exceeded
const generateFallbackContent = (platform: string, tone: string, prompt: string) => {
  const fallbackResponses = {
    linkedin: {
      professional: `🔑 Professional Insight: ${prompt}\n\nWhile we continue to evolve in this space, I'd love to hear your thoughts on this topic.\n\nShare your experiences in the comments below!\n\n#ProfessionalDevelopment #IndustryInsights`,
      conversational: `Hey connections! 👋\n\nI've been thinking about ${prompt} lately and wanted to start a conversation.\n\nWhat's your take on this? Drop your thoughts below!\n\n#LetsTalk #ProfessionalNetwork`,
      inspiring: `✨ INSPIRATION ALERT ✨\n\n${prompt} has incredible potential to transform how we work.\n\nNever stop believing in the power of innovation and continuous learning!\n\n#Inspiration #GrowthMindset`,
      educational: `📚 Learning Corner:\n\nDid you know about the impact of ${prompt}?\n\nHere are 3 key takeaways:\n1. It's transforming our industry\n2. Creates new opportunities\n3. Requires adaptive thinking\n\n#AlwaysLearning #KnowledgeSharing`,
      authoritative: `𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡: ${prompt} is revolutionizing our industry, and leaders must adapt.\n\nBased on my 10+ years of experience, this will change everything.\n\nAre you prepared?\n\n#ThoughtLeadership #IndustryTrends`
    },
    x: {
      professional: `Key insight: ${prompt} is transforming our industry. Thoughts? #ProfessionalDevelopment`,
      conversational: `Just thinking about ${prompt}. What's your take on this? #LetsTalk`,
      inspiring: `✨ ${prompt} shows how innovation drives progress! Never stop believing in possibilities. #Inspiration`,
      educational: `Did you know about ${prompt}? It's creating new opportunities while requiring new skills. #Learning`,
      authoritative: `ATTENTION: ${prompt} will change everything. Are you prepared? #ThoughtLeadership`
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

    const { prompt, tone, platform, length } = await req.json();
    
    console.log(`Generating ${platform} post with tone: ${tone}, length: ${length || 'default'}, prompt: ${prompt}`);

    let systemPrompt = '';
    
    if (platform === 'linkedin') {
      systemPrompt = `You are a social media expert who creates engaging posts for LinkedIn. 
      Write a professional ${tone} post with ${length || 'medium'} length about the following topic.
      Include relevant hashtags and format the text with paragraph breaks for readability.`;
    } else if (platform === 'x') {
      systemPrompt = `You are a social media expert who creates engaging posts for X (Twitter). 
      Write a concise ${tone} post that's under 280 characters about the following topic.
      Include 1-2 relevant hashtags.`;
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
        console.error('OpenAI API error:', response.status, JSON.stringify(errorData));
        
        let errorMessage = 'Failed to generate post with OpenAI API';
        let useFallbackContent = false;
        
        // Extract more specific error information if available
        if (errorData && errorData.error) {
          // Special handling for quota exceeded error
          if (errorData.error.type === 'insufficient_quota' || 
              errorData.error.code === 'insufficient_quota' ||
              (errorData.error.message && errorData.error.message.includes('quota'))) {
            errorMessage = 'Your OpenAI API key has exceeded its quota. Please check your billing details or use a different API key.';
            useFallbackContent = true;
          }
          else if (errorData.error.type === 'invalid_request_error' && 
              errorData.error.code === 'invalid_api_key') {
            errorMessage = 'Invalid OpenAI API key provided';
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
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
      console.error('Error communicating with OpenAI API:', apiError);
      
      // Use fallback if there's an API error
      console.log('API error. Using fallback content generator.');
      const fallbackText = generateFallbackContent(platform, tone, prompt);
      
      return new Response(
        JSON.stringify({ 
          text: fallbackText,
          isFallback: true,
          warning: 'Error communicating with OpenAI API. Using fallback content.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('General error in generate-post function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
