import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const { to_email, to_name, meeting_date, duration_minutes, meeting_type, meeting_link, notes } = await req.json();

    if (!to_email || !to_name || !meeting_date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dt = new Date(meeting_date);
    const dateStr = dt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const typeLabel = meeting_type === "video_call" ? "Video Call" : meeting_type === "phone" ? "Phone Call" : "In Person";

    const linkBlock = meeting_link ? `
      <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748B;">Join the video call</p>
        <a href="${meeting_link}" style="display: inline-block; background: #1E293B; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Join Video Call</a>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #94A3B8; word-break: break-all;">${meeting_link}</p>
      </div>
    ` : "";

    const notesBlock = notes ? `
      <div style="margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 14px; color: #64748B; font-weight: 600;">Notes</p>
        <p style="margin: 0; font-size: 15px; color: #1E293B;">${notes}</p>
      </div>
    ` : "";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1E293B;">
        <p style="font-size: 20px; font-weight: 700; margin: 0 0 4px 0;">slate<span style="color: #F59E0B;">.</span></p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Meeting confirmed</h1>
        <p style="font-size: 15px; color: #64748B; line-height: 1.6; margin: 0 0 24px 0;">Hi ${to_name}, thanks for your interest in Slate. Your meeting has been booked.</p>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;"><strong style="color: #1E293B;">Date:</strong> ${dateStr}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;"><strong style="color: #1E293B;">Time:</strong> ${timeStr}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;"><strong style="color: #1E293B;">Duration:</strong> ${duration_minutes} minutes</p>
          <p style="margin: 0; font-size: 14px; color: #64748B;"><strong style="color: #1E293B;">Type:</strong> ${typeLabel}</p>
        </div>

        ${linkBlock}
        ${notesBlock}

        <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 24px 0 8px 0;">If you need to reschedule, just reply to this email.</p>
        <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0;">See you then,<br/><strong>Noah — Slate.</strong></p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 16px 0;" />
        <p style="font-size: 12px; color: #94A3B8; margin: 0;">slatetech.co.uk</p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Noah at Slate <sales@slatetech.co.uk>",
        to: [to_email],
        subject: "Meeting confirmed — Noah, Slate.",
        html,
        reply_to: "sales@slatetech.co.uk",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend API error:", data);
      return new Response(JSON.stringify({ error: data.message || "Email failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-meeting-confirmation error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
