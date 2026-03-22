import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ALERT_EMAIL = "hello.viralin@gmail.com";
const STALE_MINUTES = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find requests that are "new", older than 5 minutes, and not yet notified
    const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

    const { data: staleRequests, error } = await supabaseAdmin
      .from("generation_requests")
      .select("id, user_email, user_name, prompt, request_type, created_at")
      .eq("status", "new")
      .is("assigned_to", null)
      .is("stale_notified_at", null)
      .lt("created_at", cutoff);

    if (error) {
      console.error("Error fetching stale requests:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!staleRequests || staleRequests.length === 0) {
      return new Response(JSON.stringify({ message: "No stale requests found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${staleRequests.length} stale request(s)`);

    // Send one email per stale request and mark as notified
    for (const req of staleRequests) {
      const minutesAgo = Math.round(
        (Date.now() - new Date(req.created_at).getTime()) / 60000
      );

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">⚠️ Unpicked Request Alert</h1>
          <p style="color: #374151;">A generation request has not been picked up for <strong>${minutesAgo} minutes</strong>.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <p><strong>User:</strong> ${req.user_name || "Unknown"} (${req.user_email})</p>
            <p><strong>Type:</strong> ${req.request_type.toUpperCase()}</p>
            <p><strong>Prompt:</strong></p>
            <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
              ${req.prompt.substring(0, 500)}
            </div>
            <p><strong>Submitted:</strong> ${new Date(req.created_at).toLocaleString()}</p>
            <p><strong>Request ID:</strong> <code>${req.id}</code></p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">Please assign an editor to this request as soon as possible.</p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: "Viralin AI <noreply@viralin.ai>",
          to: [ALERT_EMAIL],
          subject: `⚠️ Unpicked Request (${minutesAgo}min) - ${req.request_type.toUpperCase()} from ${req.user_name || req.user_email}`,
          html: htmlContent,
        });

        // Mark as notified
        await supabaseAdmin
          .from("generation_requests")
          .update({ stale_notified_at: new Date().toISOString() })
          .eq("id", req.id);

        console.log(`Notified for request ${req.id}`);
      } catch (emailErr) {
        console.error(`Failed to send notification for ${req.id}:`, emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: staleRequests.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-stale-requests:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
