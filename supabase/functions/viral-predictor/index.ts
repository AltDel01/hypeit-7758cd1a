// Viral Predictor: receives clip metadata + optional description and returns
// virality scores + brain-region heatmap inspired by Meta's neuro research.
// We do not run actual neural analysis; we use a structured AI heuristic model.

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return err(405, "Method not allowed");

  try {
    const { fileName, durationSeconds, sizeBytes, description, platform } = await req.json();
    if (typeof durationSeconds !== "number" || durationSeconds <= 0 || durationSeconds > 15) {
      return err(400, "durationSeconds must be 0-15");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return err(500, "AI not configured");

    const system = `You are a neuro-marketing analyst trained on Meta's 2024-2025 fMRI ad-response research and TikTok/Reels retention data.
Given metadata about a short video clip and a creator description, you predict virality and brain engagement.
Be honest: weak descriptions should score lower. Never use em dashes. Score on 0-100 integer scales.`;

    const userPrompt = `Analyze this short clip and return predictions via the score_clip tool.

Filename: ${fileName || "(unknown)"}
Duration: ${durationSeconds}s
File size: ${sizeBytes ? Math.round(sizeBytes / 1024) + " KB" : "(unknown)"}
Target platform: ${platform || "TikTok/Reels"}
Creator description: """${(description || "(none provided)").slice(0, 1500)}"""

Score these brain regions (0-100, where higher = stronger activation, except focus_drift where higher = WORSE):
- visual_cortex: visual richness, motion contrast, color salience
- attention_control: prefrontal lock-in, sustained focus
- auditory_processing: sound design, music, voice quality
- language_network: dialogue/caption comprehension load
- focus_drift: predicted attention loss (higher = bad)

Plus top-line:
- viral_score: composite 0-100 likelihood of viral spread on the target platform
- hook_score: strength of the first 3 seconds
- hold_rate: predicted % of viewers who watch to end

Also give 3 concrete improvements ranked by impact.`;

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
            name: "score_clip",
            description: "Return virality + neuro scores.",
            parameters: {
              type: "object",
              properties: {
                viral_score: { type: "number" },
                hook_score: { type: "number" },
                hold_rate: { type: "number" },
                verdict: { type: "string", description: "1-sentence verdict." },
                brain: {
                  type: "object",
                  properties: {
                    visual_cortex: { type: "number" },
                    attention_control: { type: "number" },
                    auditory_processing: { type: "number" },
                    language_network: { type: "number" },
                    focus_drift: { type: "number" },
                  },
                  required: ["visual_cortex", "attention_control", "auditory_processing", "language_network", "focus_drift"],
                },
                improvements: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: { type: "string" },
                },
              },
              required: ["viral_score", "hook_score", "hold_rate", "verdict", "brain", "improvements"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "score_clip" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      if (resp.status === 429) return err(429, "Rate limit reached.");
      if (resp.status === 402) return err(402, "AI credits exhausted.");
      return err(502, "AI unavailable");
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = {};
    try { parsed = JSON.parse(args || "{}"); } catch {}
    if (!parsed?.viral_score && parsed?.viral_score !== 0) return err(502, "AI returned no scores");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("viral-predictor error", e);
    return err(500, "Internal error");
  }
});
