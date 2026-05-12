// Multimodal chat router: intent classification + chat streaming via Lovable AI Gateway.
// Body: { mode: 'route' | 'chat', messages: {role,content}[], hasAttachment?: boolean }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_CHAT = `You are Viralin AI, a creative co-pilot helping users brainstorm and create viral short-form video and image content.
Be concise, practical, and idea-rich. Suggest concrete prompts the user can use to generate images/videos in this same chat.
Never use em dashes; use commas, periods, or 'to' instead.`;

const SYSTEM_ROUTE = `You are an intent router. Decide whether the latest user message wants:
- "chat": discussion, brainstorming, ideas, questions, planning.
- "image": generate or edit a still image.
- "video": generate a video clip.
If unsure, prefer "chat". If the user asks to "make / create / generate / animate / render" visual output, pick image or video. If an attachment is present and the user says "animate" or "turn into video", pick video. If the user references prior brainstorm ideas (e.g., "make idea 2"), resolve which idea and put the concrete visual description into "prompt".
For image/video, return a clean prompt (no meta words like "make a video of"), plus optional ratio (16:9|9:16|1:1|4:3|21:9), duration in seconds (2-15, video only), and useAttachmentAsFirstFrame (boolean, video only, true when user wants the image animated).`;

async function callGateway(body: any, stream = false) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  return await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, ...body, stream }),
  });
}

function gatewayErrorResponse(status: number) {
  if (status === 429) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (status === 402) {
    return new Response(
      JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return new Response(JSON.stringify({ error: "AI service unavailable" }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, messages, hasAttachment } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "route") {
      const routerMessages = [
        { role: "system", content: SYSTEM_ROUTE },
        ...messages.slice(-12),
        {
          role: "user",
          content: `(Attachment present: ${hasAttachment ? "yes" : "no"}) Classify the latest user request and return via the route_intent tool.`,
        },
      ];
      const resp = await callGateway({
        messages: routerMessages,
        tools: [
          {
            type: "function",
            function: {
              name: "route_intent",
              description: "Decide intent and extract generation parameters.",
              parameters: {
                type: "object",
                properties: {
                  intent: { type: "string", enum: ["chat", "image", "video"] },
                  prompt: { type: "string", description: "Clean visual prompt for generation; empty for chat." },
                  ratio: { type: "string", enum: ["16:9", "9:16", "1:1", "4:3", "21:9"] },
                  duration: { type: "number", description: "Video length in seconds, 2 to 15" },
                  useAttachmentAsFirstFrame: { type: "boolean" },
                },
                required: ["intent"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "route_intent" } },
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("router gateway error", resp.status, t);
        return gatewayErrorResponse(resp.status);
      }
      const data = await resp.json();
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      let parsed: any = { intent: "chat" };
      try { parsed = JSON.parse(args || "{}"); } catch {}
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: streaming chat
    const chatMessages = [
      { role: "system", content: SYSTEM_CHAT },
      ...messages,
    ];
    const resp = await callGateway({ messages: chatMessages }, true);

    if (!resp.ok || !resp.body) {
      const t = await resp.text().catch(() => "");
      console.error("chat gateway error", resp.status, t);
      return gatewayErrorResponse(resp.status);
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-router error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
