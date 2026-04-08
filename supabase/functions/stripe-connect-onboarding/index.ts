// ⚠️ DO NOT MODIFY — This function has been manually deployed. Changes here will NOT be reflected in production. Edit directly in Supabase Dashboard → Edge Functions.
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

    const { action } = await req.json().catch(() => ({ action: "create_account" }));
    const origin = req.headers.get("origin") || "https://pixel-perfect-copy-819.lovable.app";

    if (action === "create_account") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, business_name, stripe_connect_id, stripe_connect_status")
        .eq("id", userId)
        .single();

      let accountId = profile?.stripe_connect_id;

      if (!accountId) {
        const account = await stripeRequest("accounts", "POST", {
          type: "standard",
          country: "GB",
          email: profile?.email,
          business_profile: { name: profile?.business_name || undefined },
        });
        accountId = account.id;
        console.log(`Created Stripe Connect account ${accountId} for user ${userId}`);

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            stripe_connect_id: accountId,
            stripe_connect_status: "connecting",
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Failed to save stripe_connect_id:", updateError);
        } else {
          console.log("Saved stripe_connect_id to profile");
        }
      }

      const accountLink = await stripeRequest("account_links", "POST", {
        account: accountId,
        refresh_url: `${origin}/dashboard/settings?stripe=refresh`,
        return_url: `${origin}/dashboard/settings?stripe=success`,
        type: "account_onboarding",
      });

      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_connect_id")
        .eq("id", userId)
        .single();

      if (!profile?.stripe_connect_id) {
        return new Response(JSON.stringify({ status: "not_connected" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const account = await stripeRequest(`accounts/${profile.stripe_connect_id}`);
      const status = account.charges_enabled ? "active" : "connecting";

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_connect_status: status })
        .eq("id", userId);

      return new Response(JSON.stringify({
        status,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_login_link") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_connect_id")
        .eq("id", userId)
        .single();

      if (!profile?.stripe_connect_id) {
        return new Response(JSON.stringify({ error: "No Stripe account connected" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const loginLink = await stripeRequest(`accounts/${profile.stripe_connect_id}/login_links`, "POST");
        return new Response(JSON.stringify({ url: loginLink.url }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ url: "https://dashboard.stripe.com" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Stripe Connect error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
