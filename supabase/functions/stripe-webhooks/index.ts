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
        params.append(key, String(value));
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

// Stripe webhook signature verification using Web Crypto API
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<any> {
  const parts = sigHeader.split(",");
  let timestamp = "";
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid signature header");
  }

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (!signatures.includes(expectedSig)) {
    throw new Error("Signature verification failed");
  }

  return JSON.parse(payload);
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

  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.text();

    // Verify webhook signature
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_email || "";
        const planId = session.metadata?.plan_id;
        const producerId = session.metadata?.producer_id;
        const customerId = session.customer || null;
        const subscriptionId = session.subscription || null;

        if (producerId && customerEmail) {
          let planName = "Unknown Plan";
          if (planId) {
            const { data: plan } = await supabase
              .from("plans")
              .select("name")
              .eq("id", planId)
              .single();
            if (plan) planName = plan.name;
          }

          // Check if user exists in auth, if not create one
          let userId: string | null = null;
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find((u: any) => u.email === customerEmail);

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const tempPassword = crypto.randomUUID() + "Aa1!";
            const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: tempPassword,
              email_confirm: true,
            });
            if (newUser?.user) {
              userId = newUser.user.id;
              await supabase.from("user_roles")
                .update({ role: "customer" })
                .eq("user_id", userId);
            }
            if (createErr) console.error("Error creating customer auth user:", createErr);
          }

          // Fetch subscription period if available
          let periodStart: string | null = null;
          let periodEnd: string | null = null;
          if (subscriptionId) {
            try {
              const sub = await stripeRequest(`subscriptions/${subscriptionId}`);
              periodStart = new Date(sub.current_period_start * 1000).toISOString();
              periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            } catch { /* ignore */ }
          }

          await supabase.from("subscribers").insert({
            producer_id: producerId,
            name: customerEmail.split("@")[0],
            email: customerEmail,
            plan: planName,
            status: "active",
            joined_at: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            revenue: "£0",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            user_id: userId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          });

          if (userId) {
            await supabase.from("customer_profiles").insert({
              user_id: userId,
              producer_id: producerId,
              name: customerEmail.split("@")[0],
            });
          }

          console.log(`Created subscriber: ${customerEmail} for producer ${producerId}, userId: ${userId}`);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        const customer = await stripeRequest(`customers/${subscription.customer}`);
        const customerEmail = customer.email || "";

        const connectAccountId = event.account;
        if (connectAccountId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, commission_percentage")
            .eq("stripe_connect_id", connectAccountId)
            .single();

          if (profile) {
            const amount = subscription.items?.data?.[0]?.price?.unit_amount || 0;
            const commission = Math.round(amount * (profile.commission_percentage / 100));
            const stripeFee = Math.round(amount * 0.022 + 30);
            const net = amount - stripeFee - commission;

            await supabase.from("subscriptions").insert({
              producer_id: profile.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer,
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
        const subscription = event.data.object;
        const status = subscription.status === "active" ? "active" :
          subscription.status === "past_due" ? "past_due" :
          subscription.status === "canceled" ? "canceled" : "incomplete";

        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        const isPaused = !!subscription.pause_collection;
        const subStatus = isPaused ? "paused" : status === "canceled" ? "cancelled" : status === "active" ? "active" : status;
        await supabase
          .from("subscribers")
          .update({
            status: subStatus,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (status === "canceled") {
          const customer = await stripeRequest(`customers/${subscription.customer}`);
          if (customer.email) {
            await supabase
              .from("subscribers")
              .update({ status: "cancelled" })
              .eq("email", customer.email);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        const customer = await stripeRequest(`customers/${subscription.customer}`);
        if (customer.email) {
          await supabase
            .from("subscribers")
            .update({ status: "cancelled" })
            .eq("email", customer.email);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const connectAccountId = event.account;

        if (connectAccountId && invoice.customer_email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, commission_percentage")
            .eq("stripe_connect_id", connectAccountId)
            .single();

          if (profile) {
            const amount = invoice.amount_paid || 0;
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

            const revenuePounds = (amount / 100).toFixed(0);
            console.log(`Invoice paid: £${revenuePounds} from ${invoice.customer_email}`);
          }
        }
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object;
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
        const account = event.data.object;
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
