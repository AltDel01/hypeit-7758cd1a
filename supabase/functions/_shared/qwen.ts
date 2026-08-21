// Shared Alibaba DashScope (Qwen) chat helper.
// OpenAI-compatible endpoint, Singapore/international region.

export const DASHSCOPE_CHAT_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

// Latest Qwen chat models, tried in order (first available on the account wins).
export const QWEN_TEXT_MODELS = ["qwen3-max", "qwen-plus"];
// Vision-capable models for image input.
export const QWEN_VISION_MODELS = ["qwen3-vl-plus", "qwen-vl-max"];

export interface QwenOptions {
  stream?: boolean;
  vision?: boolean;
  models?: string[];
}

/**
 * Calls DashScope with model fallback. Returns the raw Response so callers can
 * stream or inspect status codes themselves.
 */
export async function callQwen(body: Record<string, unknown>, opts: QwenOptions = {}) {
  const apiKey = Deno.env.get("QWEN_API_KEY");
  if (!apiKey) throw new Error("QWEN_API_KEY missing");

  const models = opts.models ?? (opts.vision ? QWEN_VISION_MODELS : QWEN_TEXT_MODELS);
  let last: Response | null = null;

  for (const model of models) {
    const resp = await fetch(DASHSCOPE_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, ...body, stream: !!opts.stream }),
    });
    if (resp.ok) return resp;
    if (resp.status === 400 || resp.status === 404) {
      const text = await resp.text().catch(() => "");
      console.error("dashscope model rejected", model, resp.status, text);
      last = new Response(text, { status: resp.status });
      continue;
    }
    return resp;
  }
  return last ?? new Response("", { status: 500 });
}
