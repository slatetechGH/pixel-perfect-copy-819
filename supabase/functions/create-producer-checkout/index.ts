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
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SLATE_STANDARD_PRICE_ID = Deno.env.get("SLATE_STANDARD_PRICE_ID");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    const { success_url, cancel_url } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      // Search for existing customer by email
      const customers = await stripeRequest(`customers?email=${encodeURIComponent(profile.email)}&limit=1`);
      if (customers.data?.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripeRequest("customers", "POST", { email: profile.email });
        customerId = customer.id;
      }
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const priceId = SLATE_STANDARD_PRICE_ID;
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Standard plan price not configured. Set SLATE_STANDARD_PRICE_ID secret." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || "";
    const safeFallback = origin || "https://pixel-perfect-copy-819.lovable.app";

    function isAllowedUrl(url: string | undefined): string {
      if (!url) return safeFallback + "/dashboard/upgrade";
      try {
        const parsed = new URL(url);
        if (origin && parsed.origin === origin) return url;
        if (parsed.hostname.endsWith(".lovable.app")) return url;
        return safeFallback + "/dashboard/upgrade";
      } catch {
        return safeFallback + "/dashboard/upgrade";
      }
    }

    const session = await stripeRequest("checkout/sessions", "POST", {
      customer: customerId,
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: isAllowedUrl(success_url),
      cancel_url: isAllowedUrl(cancel_url),
      allow_promotion_codes: "true",
      "metadata[producer_id]": user.id,
      "metadata[type]": "slate_standard_upgrade",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Producer checkout error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
