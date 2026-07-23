import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_recent_generations",
  title: "List recent generations",
  description:
    "List the signed-in user's most recent Viralin AI generation requests (image or video) with status and result URLs.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("How many recent requests to return."),
    status: z
      .enum(["pending", "processing", "completed", "failed"])
      .nullable()
      .describe("Optional status filter. Null returns all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let query = sb
      .from("generation_requests")
      .select("id, request_type, category, status, prompt, result_url, created_at, credits_used")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { requests: data ?? [] },
    };
  },
});
