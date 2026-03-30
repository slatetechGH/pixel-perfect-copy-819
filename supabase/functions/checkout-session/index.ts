// DO NOT MODIFY — This function uses direct Stripe API calls. Do NOT replace with Stripe SDK.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

async function stripeRequest(endpoint: string, method = "GET", body?: Record<string, any>) {
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        if (typeof value === "object" && !Array.isArray(value)) {
          for (const [subKey, subValue] of Object.entries(value)) {
            params.append(`${key}[${subKey}]`, String(subValue));
          }
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object") {
              for (const [subKey, subValue] of Object.entries(item)) {
                params.append(`${key}[${index}][${subKey}]`, String(subValue));
              }
            } else {
              params.append(`${key}[${index}]`, String(item));
            }
          });
        } else {
          params.append(key, String(value));
        }
      }
    }
    options.body = params.toString();
  }

  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, options);
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  const userEmail = userData.user.email || "";

  try {
    const { plan_id, producer_id, success_url, cancel_url } = await req.json();

    if (!plan_id || !producer_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || "";
    const safeFallback = origin || "https://pixel-perfect-copy-819.lovable.app";

    function isAllowedUrl(url: string | undefined): string {
      if (!url) return safeFallback + "/";
      try {
        const parsed = new URL(url);
        if (origin && parsed.origin === origin) return url;
        if (parsed.hostname.endsWith(".lovable.app")) return url;
        return safeFallback + "/";
      } catch {
        return safeFallback + "/";
      }
    }

    const safeSuccessUrl = isAllowedUrl(success_url);
    const safeCancelUrl = isAllowedUrl(cancel_url);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Look up plan
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("name, price_num, is_free, stripe_price_id")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (plan.is_free) {
      return new Response(JSON.stringify({ error: "Cannot checkout for a free plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up producer's Stripe Connect account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_connect_id, stripe_connect_status, commission_percentage")
      .eq("id", producer_id)
      .single();

    if (profileError || !profile?.stripe_connect_id) {
      return new Response(JSON.stringify({ error: "This producer hasn't set up payments yet. Check back soon!" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.stripe_connect_status !== "active") {
      return new Response(JSON.stringify({ error: "This producer is still setting up payments. Check back soon!" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commission = profile.commission_percentage || 8;

    let priceId = plan.stripe_price_id;

    if (!priceId) {
      // Create product on platform
      const product = await stripeRequest("products", "POST", {
        name: plan.name,
        "metadata[plan_id]": plan_id,
        "metadata[producer_id]": producer_id,
      });

      const price = await stripeRequest("prices", "POST", {
        product: product.id,
        unit_amount: String(Math.round(plan.price_num * 100)),
        currency: "gbp",
        "recurring[interval]": "month",
      });

      priceId = price.id;

      await supabase
        .from("plans")
        .update({ stripe_price_id: priceId })
        .eq("id", plan_id);
    }

    // Create checkout session with destination charges
    const session = await stripeRequest("checkout/sessions", "POST", {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      customer_email: userEmail,
      success_url: safeSuccessUrl,
      cancel_url: safeCancelUrl,
      "subscription_data[application_fee_percent]": String(commission),
      "subscription_data[transfer_data][destination]": profile.stripe_connect_id,
      "metadata[plan_id]": plan_id,
      "metadata[producer_id]": producer_id,
      "metadata[user_id]": userId,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Checkout session error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
