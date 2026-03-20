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
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret is set
    if (STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as Stripe.Customer).email || "";

        // Find the producer via the connected account
        const connectAccountId = event.account;
        if (connectAccountId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, commission_percentage")
            .eq("stripe_connect_id", connectAccountId)
            .single();

          if (profile) {
            const amount = subscription.items.data[0]?.price?.unit_amount || 0;
            const commission = Math.round(amount * (profile.commission_percentage / 100));
            const stripeFee = Math.round(amount * 0.022 + 30); // 2.2% + 30p in pence
            const net = amount - stripeFee - commission;

            await supabase.from("subscriptions").insert({
              producer_id: profile.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              customer_email: customerEmail,
              amount_paid: amount,
              slate_commission_earned: commission,
              producer_net: net,
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === "active" ? "active" :
          subscription.status === "past_due" ? "past_due" :
          subscription.status === "canceled" ? "canceled" : "incomplete";

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        const connectAccountId = event.account;

        if (connectAccountId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, commission_percentage")
            .eq("stripe_connect_id", connectAccountId)
            .single();

          if (profile) {
            const amount = charge.amount;
            const commission = Math.round(amount * (profile.commission_percentage / 100));

            await supabase.from("transactions").insert({
              producer_id: profile.id,
              transaction_type: "payment_received",
              amount,
              stripe_event_id: event.id,
            });

            await supabase.from("transactions").insert({
              producer_id: profile.id,
              transaction_type: "commission_deducted",
              amount: commission,
              stripe_event_id: event.id,
            });
          }
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const status = account.charges_enabled ? "active" : "connecting";
        
        await supabase
          .from("profiles")
          .update({ stripe_connect_status: status })
          .eq("stripe_connect_id", account.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
