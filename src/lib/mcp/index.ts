import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listGenerationsTool from "./tools/list-generations";
import getCreditBalanceTool from "./tools/get-credit-balance";
import listPostingHistoryTool from "./tools/list-posting-history";

// Build the OAuth issuer from the Supabase project ref. We use VITE_SUPABASE_PROJECT_ID
// (inlined by Vite at build time) so the issuer stays a literal — import-safe for the
// build-time manifest extract and Edge Function cold start. Never derive from SUPABASE_URL
// (may be a proxy host) — mcp-js rejects a mismatched issuer per RFC 8414.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "viralin-ai-mcp",
  title: "Viralin AI",
  version: "0.1.0",
  instructions:
    "Tools for Viralin AI. Read the signed-in user's generation history, credit balance, and Creative Workflow posting history.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listGenerationsTool, getCreditBalanceTool, listPostingHistoryTool],
});
