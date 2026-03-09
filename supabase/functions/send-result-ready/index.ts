import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResultReadyPayload {
  userEmail: string;
  userName: string;
  requestType: "video" | "image";
  prompt: string;
  siteUrl: string;
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ResultReadyPayload = await req.json();
    const { userEmail, userName, requestType, prompt, requestId } = payload;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing userEmail" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const dashboardUrl = `https://viralin.ai/dashboard?request=${requestId}`;
    const typeLabel = requestType === "video" ? "Video" : "Image";
    const typeEmoji = requestType === "video" ? "🎬" : "🖼️";
    const truncatedPrompt = prompt.length > 100 ? prompt.slice(0, 100) + "..." : prompt;

    const subject = `${typeEmoji} Your ${typeLabel} is Ready! - Viralin AI`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${typeEmoji} Your ${typeLabel} is Ready!</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName || "there"}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Great news! Your ${typeLabel.toLowerCase()} generation request has been completed.
          </p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">YOUR PROMPT</p>
            <p style="color: #374151; font-size: 14px; margin: 0;">${truncatedPrompt}</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
              View Your Result →
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            Click the button above to view and download your ${typeLabel.toLowerCase()} in your request history.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Viralin AI — Your creative partner</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Viralin AI <noreply@viralin.ai>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    console.log("Result-ready email sent to", userEmail, emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-result-ready:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
