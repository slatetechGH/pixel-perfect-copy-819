import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    // Get producer from JWT
    const authHeader = req.headers.get("Authorization");
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await supabaseAnon.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const supabase = createClient(supabaseUrl, serviceKey);
    const { contact_ids } = await req.json();
    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      throw new Error("contact_ids required");
    }

    // Fetch producer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, logo_url, accent_color, email, url_slug")
      .eq("id", user.id)
      .single();

    const businessName = profile?.business_name || "Business";
    const accentColor = profile?.accent_color || "#1E293B";
    const logoUrl = profile?.logo_url;
    const urlSlug = profile?.url_slug || "";

    // Get the public storefront URL
    const siteOrigin = req.headers.get("origin") || "https://pixel-perfect-copy-819.lovable.app";
    const storefrontUrl = `${siteOrigin}/store/${urlSlug}`;

    // Fetch contacts
    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .in("id", contact_ids)
      .eq("producer_id", user.id);

    let sentCount = 0;
    for (const contact of (contacts || [])) {
      const html = `
<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f8fafc;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;">
${logoUrl ? `<div style="text-align:center;padding:16px 0;"><img src="${logoUrl}" alt="" style="max-width:120px;max-height:60px;" /></div>` : ""}
<div style="background:${accentColor};padding:12px 20px;border-radius:8px 8px 0 0;">
  <span style="color:white;font-weight:700;font-size:16px;">${esc(businessName)}</span>
</div>
<div style="background:white;border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 8px 8px;">
  <h2 style="margin:0 0 12px;font-size:18px;color:#1e293b;">Join ${esc(businessName)} on Slate</h2>
  <p style="font-size:14px;line-height:1.6;color:#334155;">${esc(businessName)} is now on Slate — the subscription platform for local producers.</p>
  <p style="font-size:14px;line-height:1.6;color:#334155;">Subscribe to get exclusive access to content, product drops, and more.</p>
  <div style="text-align:center;margin:24px 0;">
    <a href="${storefrontUrl}" style="display:inline-block;background:${accentColor};color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">View plans and subscribe →</a>
  </div>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
  <p style="font-size:10px;color:#cbd5e1;margin:0;">Powered by Slate</p>
</div>
</div></body></html>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: `${businessName} <notifications@slatetech.co.uk>`,
            to: [contact.email],
            reply_to: profile?.email || undefined,
            subject: `Join ${businessName} on Slate`,
            html,
          }),
        });
        if (res.ok) sentCount++;
      } catch { /* continue */ }

      // Update contact status
      await supabase.from("contacts").update({
        status: "invited",
        invited_at: new Date().toISOString(),
      }).eq("id", contact.id);
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
