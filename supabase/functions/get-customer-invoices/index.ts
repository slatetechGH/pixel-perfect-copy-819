import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

async function stripeRequest(endpoint: string) {
  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Stripe API error:", data);
    throw new Error(data.error?.message || "Stripe API request failed");
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Payment service not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;

  try {
    // Get ALL subscriber records for this customer (across all producers)
    const { data: subscribers } = await supabaseAdmin
      .from("subscribers")
      .select("stripe_customer_id, producer_id")
      .eq("user_id", userId)
      .not("stripe_customer_id", "is", null);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ invoices: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get producer names for labelling
    const producerIds = [...new Set(subscribers.map(s => s.producer_id))];
    const { data: producers } = await supabaseAdmin
      .from("profiles")
      .select("id, business_name")
      .in("id", producerIds);

    const producerMap: Record<string, string> = {};
    (producers || []).forEach((p: any) => { producerMap[p.id] = p.business_name || "Unknown"; });

    // Fetch invoices from each unique Stripe customer ID
    const customerIds = [...new Set(subscribers.filter(s => s.stripe_customer_id).map(s => s.stripe_customer_id!))];
    
    // Map customer_id -> producer_id
    const customerToProducer: Record<string, string> = {};
    subscribers.forEach(s => {
      if (s.stripe_customer_id) customerToProducer[s.stripe_customer_id] = s.producer_id;
    });

    const allInvoices: any[] = [];

    for (const custId of customerIds) {
      try {
        const invoices = await stripeRequest(`invoices?customer=${custId}&limit=12`);
        const producerId = customerToProducer[custId];
        const producerName = producerMap[producerId] || "Unknown";

        for (const inv of (invoices.data || [])) {
          allInvoices.push({
            date: new Date((inv.created || 0) * 1000).toISOString(),
            amount: inv.amount_paid || 0,
            status: inv.status || "unknown",
            invoice_url: inv.hosted_invoice_url || null,
            producer_name: producerName,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch invoices for customer ${custId}:`, err);
      }
    }

    // Sort by date descending
    allInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(JSON.stringify({ invoices: allInvoices.slice(0, 24) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Get customer invoices error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
