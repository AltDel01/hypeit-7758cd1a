import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ALERT_EMAIL = "hello.viralin@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Thresholds in minutes and their corresponding warning column
const THRESHOLDS = [
  { minutes: 15, column: "editor_warn_15min_at", label: "15 minutes", emoji: "🔴" },
  { minutes: 10, column: "editor_warn_10min_at", label: "10 minutes", emoji: "🟡" },
  { minutes: 5, column: "editor_warn_5min_at", label: "5 minutes", emoji: "🟣" },
] as const;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = Date.now();
    let totalNotified = 0;

    // Only look at requests that are assigned but not completed
    // and assigned within the last 60 minutes (don't process ancient ones)
    const sixtyMinAgo = new Date(now - 60 * 60 * 1000).toISOString();

    const { data: activeRequests, error } = await supabaseAdmin
      .from("generation_requests")
      .select("id, user_email, user_name, prompt, request_type, assigned_at, assigned_to_name, editor_warn_5min_at, editor_warn_10min_at, editor_warn_15min_at")
      .in("status", ["new", "in-progress", "processing"])
      .not("assigned_to", "is", null)
      .not("assigned_at", "is", null)
      .gt("assigned_at", sixtyMinAgo);

    if (error) {
      console.error("Error fetching active requests:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!activeRequests || activeRequests.length === 0) {
      return new Response(JSON.stringify({ message: "No active assigned requests" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    for (const req of activeRequests) {
      const assignedAt = new Date(req.assigned_at).getTime();
      const minutesSinceAssigned = (now - assignedAt) / 60000;

      for (const threshold of THRESHOLDS) {
        // Skip if not yet past this threshold
        if (minutesSinceAssigned < threshold.minutes) continue;

        // Skip if already notified for this threshold
        if (req[threshold.column as keyof typeof req]) continue;

        // Atomic claim: mark as notified first
        const { data: claimed } = await supabaseAdmin
          .from("generation_requests")
          .update({ [threshold.column]: new Date().toISOString() })
          .eq("id", req.id)
          .is(threshold.column, null)
          .select("id");

        if (!claimed || claimed.length === 0) {
          console.log(`Request ${req.id} threshold ${threshold.label} already claimed`);
          continue;
        }

        const minutesAgo = Math.round(minutesSinceAssigned);

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${threshold.minutes === 15 ? '#dc2626' : threshold.minutes === 10 ? '#ca8a04' : '#7c3aed'};">
              ${threshold.emoji} Editor SLA Warning — ${threshold.label}
            </h1>
            <p style="color: #374151;">
              A request assigned to <strong>${req.assigned_to_name || "an editor"}</strong> has been open for 
              <strong>${minutesAgo} minutes</strong> without completion.
            </p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid ${threshold.minutes === 15 ? '#dc2626' : threshold.minutes === 10 ? '#ca8a04' : '#7c3aed'};">
              <p><strong>User:</strong> ${req.user_name || "Unknown"} (${req.user_email})</p>
              <p><strong>Type:</strong> ${req.request_type.toUpperCase()}</p>
              <p><strong>Editor:</strong> ${req.assigned_to_name || "Unknown"}</p>
              <p><strong>Prompt:</strong></p>
              <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
                ${req.prompt.substring(0, 500)}
              </div>
              <p><strong>Request ID:</strong> <code>${req.id}</code></p>
            </div>
            <p style="color: #6b7280; margin-top: 20px;">
              Please follow up with the editor to ensure timely completion.
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: "Viralin AI <noreply@viralin.ai>",
            to: [ALERT_EMAIL],
            subject: `${threshold.emoji} Editor SLA (${threshold.label}) - ${req.request_type.toUpperCase()} by ${req.assigned_to_name || "editor"}`,
            html: htmlContent,
          });
          totalNotified++;
          console.log(`Sent ${threshold.label} warning for request ${req.id}`);
        } catch (emailErr) {
          console.error(`Failed to send ${threshold.label} warning for ${req.id}:`, emailErr);
          // Roll back claim so it can retry
          await supabaseAdmin
            .from("generation_requests")
            .update({ [threshold.column]: null })
            .eq("id", req.id);
        }

        // Only send the highest applicable threshold per request per run
        break;
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: totalNotified }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-editor-sla:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
