// ⚠️ DO NOT MODIFY — This function has been manually deployed. Changes here will NOT be reflected in production. Edit directly in Supabase Dashboard → Edge Functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const producerId = url.searchParams.get("producer");

    if (!email || !producerId) {
      return new Response(htmlPage("Invalid unsubscribe link."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get producer name
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name")
      .eq("id", producerId)
      .single();

    const businessName = profile?.business_name || "this business";

    // Update contact status
    await supabase
      .from("contacts")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("producer_id", producerId)
      .eq("email", email.toLowerCase());

    return new Response(
      htmlPage(`You've been unsubscribed from ${businessName} emails. You won't receive any further broadcasts.`),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new Response(htmlPage("Something went wrong. Please try again later."), {
      headers: { "Content-Type": "text/html" },
    });
  }
});

function htmlPage(message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title></head>
<body style="margin:0;padding:40px 20px;background:#f8fafc;font-family:sans-serif;display:flex;justify-content:center;">
<div style="max-width:480px;text-align:center;">
  <h1 style="font-size:20px;color:#1e293b;margin-bottom:12px;">Unsubscribed</h1>
  <p style="font-size:15px;color:#64748b;line-height:1.6;">${message}</p>
  <p style="font-size:12px;color:#cbd5e1;margin-top:24px;">Powered by Slate</p>
</div></body></html>`;
}
