// ⚠️ DO NOT MODIFY — This function has been manually deployed. Changes here will NOT be reflected in production. Edit directly in Supabase Dashboard → Edge Functions.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "sales@slatetech.co.uk";

function esc(s: string | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { type, data } = await req.json();

    let subject: string;
    let htmlBody: string;
    let replyTo: string | undefined;

    if (type === "contact") {
      const { name, email, company, phone, message } = data;
      subject = `New Enquiry from ${esc(name)} — ${esc(company)}`;
      replyTo = email;
      htmlBody = `
        <h2>You have a new enquiry from the Slate website</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Name</td><td style="padding:6px 0;">${esc(name)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td style="padding:6px 0;">${esc(email)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Company</td><td style="padding:6px 0;">${esc(company)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Phone</td><td style="padding:6px 0;">${esc(phone) || "—"}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Message</td><td style="padding:6px 0;">${esc(message)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Submitted at</td><td style="padding:6px 0;">${new Date().toISOString()}</td></tr>
        </table>
      `;
    } else if (type === "signup") {
      const { name, email, company, interests, plan } = data;
      subject = `New Producer Signup — ${esc(company)}`;
      replyTo = email;
      htmlBody = `
        <h2>New producer signup on Slate</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Name</td><td style="padding:6px 0;">${esc(name)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td style="padding:6px 0;">${esc(email)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Company</td><td style="padding:6px 0;">${esc(company)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Interests</td><td style="padding:6px 0;">${esc((interests || []).join(", ")) || "—"}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Selected Plan</td><td style="padding:6px 0;">${esc(plan) || "—"}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Signed up at</td><td style="padding:6px 0;">${new Date().toISOString()}</td></tr>
        </table>
      `;
    } else if (type === "newsletter") {
      const { email } = data;
      subject = `New Newsletter Subscriber — ${esc(email)}`;
      htmlBody = `
        <h2>New newsletter subscriber on Slate</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td style="padding:6px 0;">${esc(email)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Subscribed at</td><td style="padding:6px 0;">${new Date().toISOString()}</td></tr>
        </table>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendPayload: Record<string, unknown> = {
      from: "Slate <notifications@slatetech.co.uk>",
      to: [ADMIN_EMAIL],
      subject,
      html: htmlBody,
    };
    if (replyTo) resendPayload.reply_to = replyTo;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendPayload),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error("Resend API error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await resendRes.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("send-enquiry-email error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
