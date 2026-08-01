import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ALERT_EMAIL = "hello.viralin@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 5000);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      position,
      application_type,
      persona_type,
      portfolio_url,
      cover_letter,
      has_cv,
    } = body ?? {};

    if (!full_name || !position) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const typeLabel = application_type === "intern" ? "Internship" : "Full-Time";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111">
        <h2 style="color:#8C52FF;margin-bottom:4px">New Career Application</h2>
        <p style="margin-top:0;font-size:15px"><strong>${esc(position)}</strong> &middot; ${esc(typeLabel)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;width:150px;color:#666">Name</td><td>${esc(full_name)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Email</td><td>${esc(email) || "-"}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Phone</td><td>${esc(phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Self-described</td><td>${esc(persona_type) || "-"}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Portfolio</td><td>${portfolio_url ? `<a href="${esc(portfolio_url)}">${esc(portfolio_url)}</a>` : "-"}</td></tr>
          <tr><td style="padding:6px 0;color:#666">CV attached</td><td>${has_cv ? "Yes, download it in the admin panel" : "No"}</td></tr>
        </table>
        <h3 style="margin-top:24px;font-size:15px">Why they applied</h3>
        <p style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(cover_letter)}</p>
        <p style="margin-top:24px;font-size:13px">
          <a href="https://viralin.ai/admin" style="color:#8C52FF">Open the admin panel</a> to review, download the CV and update the status.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Viralin Careers <noreply@viralin.ai>",
      to: [ALERT_EMAIL],
      reply_to: email || undefined,
      subject: `New application: ${position} (${typeLabel}) - ${full_name}`,
      html,
    } as Record<string, unknown>);

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: "Failed to send notification" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-career-application error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
