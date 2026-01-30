import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ADMIN_EMAIL = "eka@viralin.ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SignupNotification {
  type: "signup";
  userName: string;
  userEmail: string;
  timestamp: string;
}

interface GenerationRequestNotification {
  type: "generation_request";
  userName: string;
  userEmail: string;
  requestType: "video" | "image";
  prompt: string;
  aspectRatio?: string;
  timestamp: string;
}

type NotificationPayload = SignupNotification | GenerationRequestNotification;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    
    let subject: string;
    let htmlContent: string;

    if (payload.type === "signup") {
      subject = "🎉 New User Signup - HypeIt";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">New User Signup</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${payload.userName || "Not provided"}</p>
            <p><strong>Email:</strong> ${payload.userEmail}</p>
            <p><strong>Signup Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">This notification was sent from HypeIt.</p>
        </div>
      `;
    } else if (payload.type === "generation_request") {
      const requestTypeEmoji = payload.requestType === "video" ? "🎬" : "🖼️";
      subject = `${requestTypeEmoji} New ${payload.requestType.charAt(0).toUpperCase() + payload.requestType.slice(1)} Generation Request - HypeIt`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">New Generation Request</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>User:</strong> ${payload.userName || "Unknown"} (${payload.userEmail})</p>
            <p><strong>Type:</strong> ${payload.requestType.toUpperCase()}</p>
            <p><strong>Prompt:</strong></p>
            <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
              ${payload.prompt}
            </div>
            ${payload.aspectRatio ? `<p><strong>Aspect Ratio:</strong> ${payload.aspectRatio}</p>` : ""}
            <p><strong>Request Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">View and manage this request in the admin dashboard.</p>
        </div>
      `;
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "HypeIt <noreply@viralin.ai>",
      to: [ADMIN_EMAIL],
      subject,
      html: htmlContent,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
