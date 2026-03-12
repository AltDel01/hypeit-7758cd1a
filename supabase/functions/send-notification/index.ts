import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ADMIN_EMAIL = "eka@viralin.ai";
const REFUND_EMAIL = "hello.viralin@gmail.com";

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

interface RefundRequestNotification {
  type: "refund_request";
  userName: string;
  userEmail: string;
  issue: string;
  screenshotUrl?: string | null;
  timestamp: string;
}

interface ReviewFeedbackNotification {
  type: "review_feedback";
  userName: string;
  userEmail: string;
  requestId: string;
  rating: number;
  feedback: string;
  prompt?: string;
  resultUrl?: string;
  requestType?: string;
  timestamp: string;
}

type NotificationPayload = SignupNotification | GenerationRequestNotification | RefundRequestNotification | ReviewFeedbackNotification;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: NotificationPayload = await req.json();
    
    let subject: string;
    let htmlContent: string;

    if (payload.type === "signup") {
      subject = "🎉 New User Signup - Viralin AI";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">New User Signup</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${payload.userName || "Not provided"}</p>
            <p><strong>Email:</strong> ${payload.userEmail}</p>
            <p><strong>Signup Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">This notification was sent from Viralin AI.</p>
        </div>
      `;
    } else if (payload.type === "generation_request") {
      const requestTypeEmoji = payload.requestType === "video" ? "🎬" : "🖼️";
      subject = `${requestTypeEmoji} New ${payload.requestType.charAt(0).toUpperCase() + payload.requestType.slice(1)} Generation Request - Viralin AI`;
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
    } else if (payload.type === "refund_request") {
      subject = "🔄 Token Refund Request - Viralin AI";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Token Refund Request</h1>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <p><strong>Name:</strong> ${payload.userName || "Not provided"}</p>
            <p><strong>Email:</strong> ${payload.userEmail}</p>
            <p><strong>Issue:</strong></p>
            <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
              ${payload.issue}
            </div>
            ${payload.screenshotUrl ? `<p><strong>Screenshot:</strong> File uploaded at <code>${payload.screenshotUrl}</code></p>` : "<p><em>No screenshot attached</em></p>"}
            <p><strong>Request Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">Please review this request and take appropriate action.</p>
        </div>
      `;
    } else if (payload.type === "review_feedback") {
      const stars = "★".repeat(payload.rating) + "☆".repeat(5 - payload.rating);
      subject = `⭐ Video Review (${payload.rating}/5) - Viralin AI`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Video Review & Feedback</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>User:</strong> ${payload.userName} (${payload.userEmail})</p>
            <p><strong>Rating:</strong> <span style="font-size: 20px; color: #f59e0b;">${stars}</span> (${payload.rating}/5)</p>
            <p><strong>Request ID:</strong> <code>${payload.requestId}</code></p>
            ${payload.feedback ? `<p><strong>Feedback:</strong></p><div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">${payload.feedback}</div>` : "<p><em>No written feedback provided</em></p>"}
            <p><strong>Submitted:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
          </div>
        </div>
      `;
    } else {
      throw new Error("Invalid notification type");
    }

    const recipientEmail = (payload.type === "refund_request" || payload.type === "review_feedback") ? REFUND_EMAIL : ADMIN_EMAIL;

    const emailResponse = await resend.emails.send({
      from: "Viralin AI <noreply@viralin.ai>",
      to: [recipientEmail],
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
