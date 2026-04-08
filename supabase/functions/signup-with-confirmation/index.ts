// ⚠️ DO NOT MODIFY — This function has been manually deployed. Changes here will NOT be reflected in production. Edit directly in Supabase Dashboard → Edge Functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      password,
      name,
      businessName,
      businessType,
      phone,
      website,
    } = await req.json();

    if (!email || !password || !name || !businessName || !businessType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate signup link (creates the user + returns a confirmation URL)
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          data: {
            full_name: name,
            business_name: businessName,
            business_type: businessType,
          },
        },
      });

    if (linkError) {
      console.error("generateLink error:", linkError.message);
      return new Response(
        JSON.stringify({ error: linkError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = linkData.user?.id;

    // Build the confirmation URL that the user will click
    // The hashed_token from generateLink needs to go through the Supabase verify endpoint
    // Redirect to /login after confirmation — Login page auto-redirects to dashboard if session exists
    const siteUrl = "https://pixel-perfect-copy-819.lovable.app";
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=signup&redirect_to=${encodeURIComponent(`${siteUrl}/login`)}`;

    // Update profile with business details
    if (userId) {
      await supabaseAdmin.from("profiles").update({
        business_name: businessName,
        business_type: businessType,
        phone: phone || null,
        website: website || null,
      }).eq("id", userId);
    }

    // Send branded confirmation email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Slate <sales@slatetech.co.uk>",
        to: [email],
        subject: "Confirm your Slate account",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f8f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:40px 40px 0;">
          <div style="font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">Slate</div>
        </td></tr>
        <tr><td style="padding:32px 40px 0;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">Welcome to Slate, ${name.split(" ")[0]}!</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555;">
            Thanks for signing up. Please confirm your email address to activate your account and start setting up your storefront.
          </p>
          <a href="${confirmationUrl}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">
            Confirm my email
          </a>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#999;">
            If you didn't create a Slate account, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#999;">© ${new Date().getFullYear()} Slate · slatetech.co.uk</p>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const emailErr = await emailRes.text();
      console.error("Resend error:", emailErr);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
