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

    const supabase = createClient(supabaseUrl, serviceKey);
    const { broadcast_id } = await req.json();
    if (!broadcast_id) throw new Error("broadcast_id required");

    // Fetch broadcast
    const { data: broadcast, error: bErr } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", broadcast_id)
      .single();
    if (bErr || !broadcast) throw new Error("Broadcast not found");

    // Fetch producer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, logo_url, accent_color, email, url_slug")
      .eq("id", broadcast.producer_id)
      .single();

    const businessName = profile?.business_name || "Business";
    const accentColor = profile?.accent_color || "#1E293B";
    const logoUrl = profile?.logo_url;
    const replyTo = profile?.email;
    const urlSlug = profile?.url_slug || "";

    const targetSegments: string[] = broadcast.target_segments || [];

    // Collect recipient emails
    const emailSet = new Set<string>();

    // Mailing list contacts
    if (targetSegments.includes("Mailing list")) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("email")
        .eq("producer_id", broadcast.producer_id)
        .is("plan_id", null)
        .neq("status", "unsubscribed");
      (contacts || []).forEach((c: any) => emailSet.add(c.email.toLowerCase()));
    }

    // Plan-specific subscribers
    const planSegments = targetSegments.filter(s => s !== "Mailing list");
    if (planSegments.length > 0) {
      const { data: subs } = await supabase
        .from("subscribers")
        .select("email, plan")
        .eq("producer_id", broadcast.producer_id)
        .eq("status", "active");
      (subs || []).forEach((s: any) => {
        if (planSegments.includes(s.plan)) emailSet.add(s.email.toLowerCase());
      });
    }

    const recipients = Array.from(emailSet);

    // Rate limit check - count emails sent this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: sentThisMonth } = await supabase
      .from("broadcast_recipients")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", monthStart.toISOString());

    const remaining = 3000 - (sentThisMonth || 0);
    if (recipients.length > remaining) {
      await supabase.from("broadcasts").update({ status: "failed" }).eq("id", broadcast_id);
      throw new Error(`Monthly email limit would be exceeded. ${remaining} emails remaining.`);
    }

    // Build email HTML
    const bodyHtml = esc(broadcast.body).replace(/\n/g, "<br />");
    const unsubscribeBase = `${supabaseUrl}/functions/v1/unsubscribe`;

    let sentCount = 0;
    for (const email of recipients) {
      const unsubUrl = `${unsubscribeBase}?email=${encodeURIComponent(email)}&producer=${broadcast.producer_id}`;
      const html = `
<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f8fafc;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;">
${logoUrl ? `<div style="text-align:center;padding:16px 0;"><img src="${logoUrl}" alt="" style="max-width:120px;max-height:60px;" /></div>` : ""}
<div style="background:${accentColor};padding:12px 20px;border-radius:8px 8px 0 0;">
  <span style="color:white;font-weight:700;font-size:16px;">${esc(businessName)}</span>
</div>
<div style="background:white;border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 8px 8px;">
  <h2 style="margin:0 0 12px;font-size:18px;color:#1e293b;">${esc(broadcast.subject)}</h2>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />
  <div style="font-size:14px;line-height:1.6;color:#334155;">${bodyHtml}</div>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0 12px;" />
  <p style="font-size:11px;color:#94a3b8;margin:0;">You're receiving this because you're connected with ${esc(businessName)} on Slate.</p>
  <p style="font-size:11px;margin:4px 0 0;"><a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a></p>
  <p style="font-size:10px;color:#cbd5e1;margin:8px 0 0;">Powered by Slate</p>
</div>
</div></body></html>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: `${businessName} <notifications@slatetech.co.uk>`,
            to: [email],
            reply_to: replyTo || undefined,
            subject: broadcast.subject,
            html,
          }),
        });

        const status = res.ok ? "sent" : "failed";
        await supabase.from("broadcast_recipients").insert({
          broadcast_id,
          email,
          status,
          sent_at: new Date().toISOString(),
        });
        if (res.ok) sentCount++;
      } catch {
        await supabase.from("broadcast_recipients").insert({
          broadcast_id,
          email,
          status: "failed",
          sent_at: new Date().toISOString(),
        });
      }
    }

    // Update broadcast
    await supabase.from("broadcasts").update({
      status: "sent",
      recipient_count: sentCount,
      sent_at: new Date().toISOString(),
    }).eq("id", broadcast_id);

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
