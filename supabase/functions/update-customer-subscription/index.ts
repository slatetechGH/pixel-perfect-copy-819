import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

async function stripeRequest(endpoint: string, method = "GET", body?: Record<string, string>) {
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  if (body && method !== "GET") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      params.append(key, value);
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
    const { action, new_plan_id, subscriber_id } = await req.json();
    if (!action || !["pause", "resume", "cancel", "change_plan"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscriber record — optionally by subscriber_id for multi-subscription support
    let query = supabaseAdmin
      .from("subscribers")
      .select("id, stripe_subscription_id, stripe_customer_id, producer_id, plan")
      .eq("user_id", userId);

    if (subscriber_id) {
      query = query.eq("id", subscriber_id);
    }

    const { data: subscriber } = await query.single();

    if (!subscriber?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subId = subscriber.stripe_subscription_id;

    switch (action) {
      case "pause": {
        await stripeRequest(`subscriptions/${subId}`, "POST", {
          "pause_collection[behavior]": "void",
        });
        await supabaseAdmin.from("subscribers").update({ status: "paused" }).eq("id", subscriber.id);
        break;
      }
      case "resume": {
        await stripeRequest(`subscriptions/${subId}`, "POST", {
          "pause_collection": "",
        });
        await supabaseAdmin.from("subscribers").update({ status: "active" }).eq("id", subscriber.id);
        break;
      }
      case "cancel": {
        await stripeRequest(`subscriptions/${subId}`, "POST", {
          cancel_at_period_end: "true",
        });
        await supabaseAdmin.from("subscribers").update({ status: "cancelled" }).eq("id", subscriber.id);
        break;
      }
      case "change_plan": {
        if (!new_plan_id) {
          return new Response(JSON.stringify({ error: "new_plan_id required for change_plan" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Look up new plan's stripe_price_id
        const { data: newPlan } = await supabaseAdmin
          .from("plans")
          .select("stripe_price_id, name, price_num")
          .eq("id", new_plan_id)
          .single();

        if (!newPlan?.stripe_price_id) {
          return new Response(JSON.stringify({ error: "Plan not available for subscription changes" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get subscription to find item ID
        const sub = await stripeRequest(`subscriptions/${subId}`);
        const itemId = sub.items?.data?.[0]?.id;
        if (!itemId) {
          return new Response(JSON.stringify({ error: "Subscription item not found" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        await stripeRequest(`subscriptions/${subId}`, "POST", {
          "items[0][id]": itemId,
          "items[0][price]": newPlan.stripe_price_id,
          proration_behavior: "create_prorations",
        });

        await supabaseAdmin.from("subscribers")
          .update({ plan: newPlan.name })
          .eq("id", subscriber.id);
        break;
      }
    }

    return new Response(JSON.stringify({ success: true, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Update customer subscription error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
