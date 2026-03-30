import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft, CreditCard, Loader2, ShoppingBag, Clock,
  Pause, Play, X, ExternalLink, Receipt, Settings, LogOut, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import SlateLogo from "@/components/SlateLogo";
import { format } from "date-fns";

interface ProducerInfo {
  id: string;
  business_name: string;
  accent_color: string;
  logo_url: string | null;
  url_slug: string | null;
}

interface SubscriberInfo {
  id: string;
  plan: string;
  status: string;
  joined_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  producer_id: string;
}

interface CollectionInfo {
  id: string;
  collected_at: string;
  month_year: string;
}

interface PlanInfo {
  id: string;
  name: string;
  price_num: number;
  is_free: boolean;
  collections_per_month: number;
  stripe_price_id: string | null;
}

interface InvoiceInfo {
  date: string;
  amount: number;
  status: string;
  invoice_url: string | null;
}

const StorefrontAccount = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { session, authLoading } = useApp();

  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState<ProducerInfo | null>(null);
  const [subscriber, setSubscriber] = useState<SubscriberInfo | null>(null);
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PlanInfo[]>([]);
  const [invoices, setInvoices] = useState<InvoiceInfo[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"pause" | "cancel" | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const accentColor = producer?.accent_color || "#1E293B";

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session.isLoggedIn) {
      navigate(`/store/${businessSlug}/join?redirect=account`, { replace: true });
    }
  }, [authLoading, session.isLoggedIn, businessSlug, navigate]);

  // Fetch data
  useEffect(() => {
    if (!session.isLoggedIn || !businessSlug || !session.supabaseUser) return;

    const fetchData = async () => {
      try {
        // Get producer by slug
        const { data: pub } = await supabase
          .from("public_profiles")
          .select("id, business_name, accent_color, logo_url, url_slug")
          .eq("url_slug", businessSlug)
          .single();

        if (!pub?.id) {
          setLoading(false);
          return;
        }
        setProducer(pub as ProducerInfo);

        // Get subscriber record for this user + producer
        const { data: sub } = await supabase
          .from("subscribers")
          .select("id, plan, status, joined_at, stripe_customer_id, stripe_subscription_id, current_period_end, current_period_start, producer_id")
      .eq("user_id", session.supabaseUser?.id)
      .eq("producer_id", pub.id)
          .single();

        if (sub) {
          setSubscriber(sub as SubscriberInfo);

          // Fetch current plan by name
          const { data: plans } = await supabase
            .from("plans")
            .select("id, name, price_num, is_free, collections_per_month, stripe_price_id")
            .eq("producer_id", pub.id)
            .eq("active", true);

          if (plans) {
            const current = plans.find(p => p.name === sub.plan);
            setCurrentPlan(current as PlanInfo || null);
            setAvailablePlans((plans as PlanInfo[]).filter(p => p.name !== sub.plan && !p.is_free));
          }

          // Fetch collections for current month
          const now = new Date();
          const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const { data: cols } = await supabase
            .from("collections")
            .select("id, collected_at, month_year")
            .eq("subscriber_id", sub.id)
            .eq("month_year", monthYear);
          setCollections((cols || []) as CollectionInfo[]);

          // Fetch invoices
          if (sub.stripe_customer_id) {
            setInvoicesLoading(true);
            try {
              const { data: invData } = await supabase.functions.invoke("get-customer-invoices");
              if (invData?.invoices) setInvoices(invData.invoices);
            } catch { /* ignore */ }
            setInvoicesLoading(false);
          }
        }
      } catch (err) {
        console.error("Account fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session.isLoggedIn, session.supabaseUser?.id, businessSlug]);

  const handleAction = async (action: "pause" | "resume" | "cancel") => {
    setActionLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke("update-customer-subscription", {
        body: { action },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Something went wrong");
        return;
      }
      toast.success(
        action === "pause" ? "Subscription paused" :
        action === "resume" ? "Subscription resumed" :
        "Subscription will cancel at end of billing period"
      );
      // Update local state
      setSubscriber(prev => prev ? {
        ...prev,
        status: action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled"
      } : null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-customer-portal", {
        body: { return_url: `${window.location.origin}/store/${businessSlug}/account` },
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Unable to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/store/${businessSlug}`, { replace: true });
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      session.supabaseUser?.email || "",
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    if (error) toast.error("Failed to send reset email");
    else toast.success("Password reset email sent — check your inbox");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Store not found</h1>
          <p className="text-muted-foreground">This storefront doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <BackLink slug={businessSlug!} name={producer.business_name} />
          <div className="mt-12">
            <h1 className="text-2xl font-bold text-foreground mb-3">No active subscription</h1>
            <p className="text-muted-foreground mb-6">
              You don't have an active subscription with {producer.business_name}. Browse their plans to get started.
            </p>
            <Button
              onClick={() => navigate(`/store/${businessSlug}`)}
              className="h-11 px-6 font-semibold text-white rounded-lg"
              style={{ backgroundColor: accentColor }}
            >
              Browse Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor =
    subscriber.status === "active" ? "bg-emerald-100 text-emerald-700" :
    subscriber.status === "paused" ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";

  const collectionsUsed = collections.length;
  const collectionsTotal = currentPlan?.collections_per_month || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackLink slug={businessSlug!} name={producer.business_name} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        {/* Producer branding */}
        <div className="flex items-center gap-3 mb-8">
          {producer.logo_url ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0">
              <img src={producer.logo_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
              <span className="text-white font-bold text-lg">{producer.business_name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Account</h1>
            <p className="text-sm text-muted-foreground">{producer.business_name}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* === SECTION A: My Subscription === */}
          <motion.div
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{subscriber.plan}</h2>
                {currentPlan && !currentPlan.is_free && (
                  <p className="text-foreground font-semibold text-xl mt-0.5">£{currentPlan.price_num}/mo</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor}`}>
                {subscriber.status}
              </span>
            </div>

            {subscriber.current_period_end && subscriber.status === "active" && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Next payment: {format(new Date(subscriber.current_period_end), "d MMMM yyyy")}
              </p>
            )}
            {subscriber.joined_at && (
              <p className="text-sm text-muted-foreground mb-4">
                Member since {subscriber.joined_at}
              </p>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {subscriber.status === "active" && (
                <>
                  <Button
                    size="sm" variant="outline"
                    className="text-xs gap-1.5"
                    onClick={() => setConfirmAction("pause")}
                    disabled={!!actionLoading}
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmAction("cancel")}
                    disabled={!!actionLoading}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </>
              )}
              {subscriber.status === "paused" && (
                <Button
                  size="sm" variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => handleAction("resume")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "resume" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Resume Subscription
                </Button>
              )}
            </div>
          </motion.div>

          {/* === SECTION B: Payment Details === */}
          {subscriber.stripe_customer_id && (
            <motion.div
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            >
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Details
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your payment method and billing details through the secure Stripe portal.
              </p>
              <Button
                size="sm" variant="outline"
                className="text-xs gap-1.5"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                Manage Payment Method
              </Button>
            </motion.div>
          )}

          {/* === SECTION C: Payment History === */}
          {subscriber.stripe_customer_id && (
            <motion.div
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Payment History
              </h2>
              {invoicesLoading ? (
                <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
              ) : invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                      <div>
                        <span className="text-foreground">{format(new Date(inv.date), "d MMM yyyy")}</span>
                        <span className="ml-2 text-muted-foreground">£{(inv.amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          inv.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {inv.status}
                        </span>
                        {inv.invoice_url && (
                          <a href={inv.invoice_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* === SECTION D: Collections === */}
          {collectionsTotal > 0 && (
            <motion.div
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            >
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Collections This Month
              </h2>
              <p className="text-sm text-foreground font-medium mb-2">
                {collectionsUsed} of {collectionsTotal} used
              </p>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (collectionsUsed / collectionsTotal) * 100)}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
              {collections.length > 0 && (
                <div className="space-y-1.5">
                  {collections.map(c => (
                    <p key={c.id} className="text-sm text-muted-foreground">
                      ✓ Collected — {format(new Date(c.collected_at), "EEEE d MMMM")}
                    </p>
                  ))}
                </div>
              )}
              {collectionsUsed < collectionsTotal && (
                <p className="text-sm text-muted-foreground mt-2">
                  {collectionsTotal - collectionsUsed} remaining this month
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3">Collections reset on the 1st of each month</p>
            </motion.div>
          )}

          {/* === SECTION E: Account Settings === */}
          <motion.div
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Account Settings
            </h2>
            <div className="space-y-3">
              {session.supabaseUser?.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{session.supabaseUser.email}</p>
                </div>
              )}
              <button
                onClick={handlePasswordReset}
                className="text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: accentColor }}
              >
                Change Password <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Powered by Slate */}
        <div className="flex items-center justify-center gap-1.5 mt-12 opacity-40">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <SlateLogo size={12} asLink={false} />
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction === "pause"}
        onClose={() => setConfirmAction(null)}
        title="Pause subscription?"
        description="Your subscription will be paused. You won't be charged next month. Your plan benefits will be suspended until you resume."
        confirmText={actionLoading === "pause" ? "Pausing..." : "Pause Subscription"}
        onConfirm={() => handleAction("pause")}
      />
      <ConfirmDialog
        open={confirmAction === "cancel"}
        onClose={() => setConfirmAction(null)}
        title="Cancel subscription?"
        description={`Are you sure you want to cancel? Your plan benefits will end ${subscriber.current_period_end ? `on ${format(new Date(subscriber.current_period_end), "d MMMM yyyy")}` : "at the end of the billing period"}. You can resubscribe anytime.`}
        confirmText={actionLoading === "cancel" ? "Cancelling..." : "Cancel Subscription"}
        onConfirm={() => handleAction("cancel")}
        destructive
      />
    </div>
  );
};

function BackLink({ slug, name }: { slug: string; name: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/store/${slug}`)}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" /> Back to {name}
    </button>
  );
}

export default StorefrontAccount;
