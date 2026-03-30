import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

async function stripeRequest(endpoint: string) {
  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
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
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_connect_id, stripe_connect_status")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_connect_id) {
      return new Response(JSON.stringify({ status: "not_connected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const account = await stripeRequest(`accounts/${profile.stripe_connect_id}`);
    const status = account.charges_enabled ? "active" : "connecting";

    if (status !== profile.stripe_connect_status) {
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_connect_status: status })
        .eq("id", userId);
    }

    return new Response(JSON.stringify({
      status,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Verify Stripe status error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
