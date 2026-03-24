import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Payment service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // ── Auth: require a valid JWT ──
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub;
  const userEmail = claimsData.claims.email as string;

  try {
    const { plan_id, producer_id, success_url, cancel_url } = await req.json();

    if (!plan_id || !producer_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Validate redirect URLs: must be same origin ──
    const origin = req.headers.get("origin") || "";
    const safeFallback = origin || "https://pixel-perfect-copy-819.lovable.app";

    function isAllowedUrl(url: string | undefined): string {
      if (!url) return safeFallback + "/";
      try {
        const parsed = new URL(url);
        // Allow same origin or known production domains
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
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

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
      return new Response(JSON.stringify({ error: "Payments not available for this producer" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.stripe_connect_status !== "active") {
      return new Response(JSON.stringify({ error: "Payments not available for this producer" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commission = profile.commission_percentage || 6;

    // If plan has a stripe_price_id, use it; otherwise create an ad-hoc price
    let priceId = plan.stripe_price_id;

    if (!priceId) {
      const product = await stripe.products.create(
        { name: plan.name },
        { stripeAccount: profile.stripe_connect_id }
      );
      const price = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: Math.round(plan.price_num * 100),
          currency: "gbp",
          recurring: { interval: "month" },
        },
        { stripeAccount: profile.stripe_connect_id }
      );
      priceId = price.id;

      await supabase
        .from("plans")
        .update({ stripe_price_id: priceId })
        .eq("id", plan_id);
    }

    // Create checkout session using authenticated user's email
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: userEmail,
        success_url: safeSuccessUrl,
        cancel_url: safeCancelUrl,
        subscription_data: {
          application_fee_percent: commission,
        },
        metadata: {
          plan_id,
          producer_id,
          user_id: userId,
        },
      },
      { stripeAccount: profile.stripe_connect_id }
    );

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Checkout session error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
