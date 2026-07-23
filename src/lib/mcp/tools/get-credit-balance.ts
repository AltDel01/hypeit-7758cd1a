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
  name: "get_credit_balance",
  title: "Get credit balance",
  description:
    "Return the signed-in user's Viralin AI credit balance: monthly limit, credits used this period, remaining credits, subscription tier, and bonus credits.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("profiles")
      .select(
        "email, display_name, subscription_tier, monthly_generation_limit, generations_this_month, bonus_credits"
      )
      .eq("id", ctx.getUserId())
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: "Profile not found" }], isError: true };
    }
    const limit = Number((data as any).monthly_generation_limit ?? 0);
    const used = Number((data as any).generations_this_month ?? 0);
    const bonus = Number((data as any).bonus_credits ?? 0);
    const remaining = Math.max(0, limit - used) + bonus;
    const summary = { ...data, credits_remaining: remaining };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
