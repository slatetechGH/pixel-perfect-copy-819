import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

    const { action } = await req.json();

    if (action === "create_account") {
      // Fetch profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, business_name")
        .eq("id", userId)
        .single();

      // Create connected account
      const account = await stripe.accounts.create({
        type: "express",
        email: profile?.email,
        business_profile: {
          name: profile?.business_name || undefined,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_connect_id: account.id,
          stripe_connect_status: "connecting",
        })
        .eq("id", userId);

      // Create account link for onboarding
      const origin = req.headers.get("origin") || "https://pixel-perfect-copy-819.lovable.app";
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${origin}/dashboard/settings`,
        return_url: `${origin}/dashboard/settings?stripe_connected=true`,
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

      const account = await stripe.accounts.retrieve(profile.stripe_connect_id);
      const status = account.charges_enabled ? "active" : "connecting";

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_connect_status: status })
        .eq("id", userId);

      return new Response(JSON.stringify({ status, charges_enabled: account.charges_enabled }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
