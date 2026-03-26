import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { producer_id } = await req.json();
    if (!producer_id) {
      return new Response(JSON.stringify({ error: "producer_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get producer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, logo_url")
      .eq("id", producer_id)
      .single();

    const businessName = profile?.business_name || "Your producer";

    // Get plans with collections
    const { data: plans } = await supabase
      .from("plans")
      .select("id, name, collections_per_month")
      .eq("producer_id", producer_id)
      .gt("collections_per_month", 0);

    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No plans with collections" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planMap: Record<string, { name: string; allowance: number }> = {};
    plans.forEach((p: any) => {
      planMap[p.name] = { name: p.name, allowance: p.collections_per_month };
    });

    // Get active subscribers on collection plans
    const { data: subs } = await supabase
      .from("subscribers")
      .select("id, name, email, plan")
      .eq("producer_id", producer_id)
      .eq("status", "active")
      .in("plan", plans.map((p: any) => p.name));

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current month collections
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: existingCollections } = await supabase
      .from("collections")
      .select("subscriber_id")
      .eq("producer_id", producer_id)
      .eq("month_year", monthYear);

    const collectionCounts: Record<string, number> = {};
    (existingCollections || []).forEach((c: any) => {
      collectionCounts[c.subscriber_id] = (collectionCounts[c.subscriber_id] || 0) + 1;
    });

    // Check if reminders already sent today
    const today = now.toISOString().split("T")[0];
    const { data: existingReminders } = await supabase
      .from("collection_reminders")
      .select("id")
      .eq("producer_id", producer_id)
      .eq("sent_date", today);

    if (existingReminders && existingReminders.length > 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Reminders already sent today" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter to subscribers with remaining collections
    const eligible = subs.filter((s: any) => {
      const plan = planMap[s.plan];
      if (!plan) return false;
      const used = collectionCounts[s.id] || 0;
      return used < plan.allowance;
    });

    // Send emails via Resend
    let sentCount = 0;
    if (resendKey && eligible.length > 0) {
      for (const sub of eligible) {
        const plan = planMap[sub.plan];
        const used = collectionCounts[sub.id] || 0;
        const remaining = plan.allowance - used;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${businessName} <onboarding@resend.dev>`,
              to: [sub.email],
              subject: "Your collection is ready!",
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 20px;">
                  <h2 style="margin: 0 0 16px; font-size: 20px;">Hi ${sub.name.split(" ")[0]},</h2>
                  <p style="font-size: 16px; line-height: 1.5; color: #333;">
                    Your <strong>${plan.name}</strong> collection is ready to pick up.
                  </p>
                  <p style="font-size: 16px; line-height: 1.5; color: #333;">
                    You have <strong>${remaining} of ${plan.allowance}</strong> collection${remaining > 1 ? "s" : ""} remaining this month.
                  </p>
                  <p style="font-size: 16px; line-height: 1.5; color: #333;">See you soon!</p>
                  <p style="font-size: 16px; font-weight: 600; margin-top: 24px;">${businessName}</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #999;">Powered by Slate</p>
                </div>
              `,
            }),
          });
          sentCount++;
        } catch (e) {
          console.error(`Failed to send to ${sub.email}:`, e);
        }
      }
    } else {
      sentCount = eligible.length; // dry run
    }

    // Record the reminder
    await supabase.from("collection_reminders").insert({
      producer_id,
      sent_date: today,
      recipient_count: sentCount,
    });

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-collection-reminders error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
