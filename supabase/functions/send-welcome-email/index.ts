import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, display_name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const firstName = display_name || email.split('@')[0];

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a259ff, #d966ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
    .card { background: #111118; border: 1px solid #2a2a3a; border-radius: 16px; padding: 36px 32px; }
    .greeting { color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; }
    p { color: #b0b0c0; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .highlight { color: #d966ff; font-weight: 500; }
    .divider { height: 1px; background: #2a2a3a; margin: 24px 0; }
    .signature { color: #ffffff; font-weight: 600; margin: 0; }
    .signature-title { color: #888; font-size: 13px; margin: 4px 0 0 0; }
    .footer { text-align: center; margin-top: 32px; }
    .footer p { color: #555; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-text">Viralin AI</span>
    </div>
    <div class="card">
      <p class="greeting">Dear ${firstName},</p>
      <p>I'm <strong style="color:#fff;">Eka</strong>, the founder of <span class="highlight">Viralin AI</span>.</p>
      <p>Thank you for signing up and being part of our early journey. We're building Viralin AI to make content creation radically simpler through chat-based AI editing — and we're excited to have you with us.</p>
      <p>As a bootstrapped startup, we're continuously improving our infrastructure and product performance. While we aim to deliver a smooth experience, you may occasionally encounter minor glitches, longer loading times, or generation delays. If that happens, please know we're actively working behind the scenes to make the system faster, more stable, and more reliable every day.</p>
      <p>If the system ever crashes or fails during generation and your tokens are deducted unintentionally, please contact us right away. We will review the issue and <span class="highlight">refund or replenish your tokens</span> accordingly. Your trust matters to us, and we want to ensure you always receive full value for what you use.</p>
      <p>Your feedback is incredibly valuable at this stage. If you experience any issues or have suggestions for improvement, feel free to reply directly to this email — I read them personally.</p>
      <p>Thank you for your patience and for being an early supporter of Viralin AI. We're just getting started, and we're committed to building something great for you.</p>
      <div class="divider"></div>
      <p class="signature">Best regards,<br>Eka</p>
      <p class="signature-title">Founder, Viralin AI</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Viralin AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eka from Viralin AI <noreply@viralin.ai>',
        to: [email],
        subject: `Welcome to Viralin AI, ${firstName}! 🚀`,
        html: htmlBody,
        reply_to: 'eka@viralin.ai',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log(`Welcome email sent to ${email} (${firstName})`);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
