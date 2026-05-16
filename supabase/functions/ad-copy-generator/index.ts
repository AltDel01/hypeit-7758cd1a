// Ad Copy Generator: fetches a brand URL, extracts text, asks Lovable AI to
// produce 15 ad campaigns across various ad sizes/placements.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

function err(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchBrandText(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 ViralinBot/1.0" },
      redirect: "follow",
    });
    if (!r.ok) return "";
    const html = await r.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 8000);
  } catch (e) {
    console.error("fetchBrandText error", e);
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return err(405, "Method not allowed");

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return err(400, "Valid URL required");
    }

    const brandText = await fetchBrandText(url);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return err(500, "AI not configured");

    const system = `You are a senior performance marketing copywriter. Given a brand's website content, produce 15 distinct ad campaigns covering varied ad sizes, placements, tones, and angles.
Never use em dashes. Be concrete, conversion-focused, and platform-aware.`;

    const userPrompt = `Brand URL: ${url}

Brand website extracted content (truncated):
"""
${brandText || "(could not fetch site, infer from URL)"}
"""

Return 15 ad campaign variants via the generate_campaigns tool. Mix these formats across the 15:
- Meta Feed (1:1 square), 40-60 word body
- Meta Story / Reel (9:16), short hook + CTA
- Google Search RSA: 3 headlines (max 30 chars each) + 2 descriptions (max 90 chars each)
- YouTube Pre-Roll script (15s), spoken VO line
- LinkedIn Sponsored Post, professional tone
- TikTok hook, first 3 seconds spoken
- X/Twitter promoted post, under 240 chars
- Display banner 728x90, ultra-short headline + CTA
- Email subject line + preview text combo
Vary tone: bold, witty, urgent, educational, FOMO, social proof, problem-solution, founder-voice.`;

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_campaigns",
            description: "Return 15 ad campaign variants.",
            parameters: {
              type: "object",
              properties: {
                brand_summary: { type: "string", description: "2-sentence read on the brand and target audience." },
                campaigns: {
                  type: "array",
                  minItems: 15,
                  maxItems: 15,
                  items: {
                    type: "object",
                    properties: {
                      format: { type: "string", description: "e.g. 'Meta Feed 1:1', 'YouTube Pre-Roll 15s'" },
                      placement: { type: "string", description: "Platform/placement label" },
                      size: { type: "string", description: "e.g. '1080x1080', '1080x1920', '728x90', '15s'" },
                      tone: { type: "string" },
                      angle: { type: "string", description: "Core hook/angle" },
                      headline: { type: "string" },
                      body: { type: "string" },
                      cta: { type: "string" },
                    },
                    required: ["format", "placement", "size", "tone", "angle", "headline", "body", "cta"],
                  },
                },
              },
              required: ["brand_summary", "campaigns"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_campaigns" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      if (resp.status === 429) return err(429, "Rate limit reached. Try again shortly.");
      if (resp.status === 402) return err(402, "AI credits exhausted.");
      return err(502, "AI unavailable");
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = {};
    try { parsed = JSON.parse(args || "{}"); } catch {}
    if (!parsed?.campaigns?.length) return err(502, "AI returned no campaigns");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ad-copy-generator error", e);
    return err(500, "Internal error");
  }
});
