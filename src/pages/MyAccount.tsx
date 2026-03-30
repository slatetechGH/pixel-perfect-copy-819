import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Loader2, ShoppingBag, Clock, Pause, Play, X, ExternalLink,
  Receipt, Settings, LogOut, ChevronRight, ChevronDown, ArrowUpRight,
  User, KeyRound, Trash2, Store,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import SlateLogo from "@/components/SlateLogo";
import { format } from "date-fns";

// ===== Types =====
interface ProducerInfo {
  id: string;
  business_name: string;
  accent_color: string | null;
  logo_url: string | null;
  url_slug: string | null;
}

interface SubscriptionCard {
  subscriber: {
    id: string;
    plan: string;
    status: string;
    joined_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
    current_period_start: string | null;
    producer_id: string;
  };
  producer: ProducerInfo;
  currentPlan: PlanInfo | null;
  availablePlans: PlanInfo[];
  collections: CollectionInfo[];
  collectionsTotal: number;
}

interface PlanInfo {
  id: string;
  name: string;
  price_num: number;
  is_free: boolean;
  collections_per_month: number;
  stripe_price_id: string | null;
}

interface CollectionInfo {
  id: string;
  collected_at: string;
  month_year: string;
}

interface InvoiceInfo {
  date: string;
  amount: number;
  status: string;
  invoice_url: string | null;
  producer_name: string;
}

type Tab = "subscriptions" | "payments" | "collections" | "settings";

const MyAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, authLoading, signOut } = useApp();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionCard[]>([]);
  const [invoices, setInvoices] = useState<InvoiceInfo[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("subscriptions");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "pause" | "cancel" | "delete_account"; subId?: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const isWelcome = searchParams.get("welcome") === "true";
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const hasCollections = subscriptions.some(s => s.collectionsTotal > 0);

  // Auto-trigger password reset email for new subscribers arriving from Stripe checkout
  useEffect(() => {
    if (!isWelcome || welcomeEmailSent) return;
    setWelcomeEmailSent(true);

    const sendPasswordSetup = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const email = currentSession?.user?.email || session.supabaseUser?.email;
      if (!email) return;

      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        console.log("Password setup email sent to", email);
      } catch (err) {
        console.error("Failed to send password setup email:", err);
      }
    };

    sendPasswordSetup();
  }, [isWelcome]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !session.isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, session.isLoggedIn, navigate]);

  // Fetch all data
  useEffect(() => {
    if (!session.isLoggedIn || !session.supabaseUser) return;

    const fetchData = async () => {
      try {
        const userId = session.supabaseUser!.id;

        // Get ALL subscriber records for this user
        const { data: subs } = await supabase
          .from("subscribers")
          .select("id, plan, status, joined_at, stripe_customer_id, stripe_subscription_id, current_period_end, current_period_start, producer_id")
          .eq("user_id", userId);

        if (!subs || subs.length === 0) {
          setLoading(false);
          return;
        }

        // Get producer profiles
        const producerIds = [...new Set(subs.map(s => s.producer_id))];
        const { data: producers } = await supabase
          .from("public_profiles")
          .select("id, business_name, accent_color, logo_url, url_slug")
          .in("id", producerIds);

        const producerMap: Record<string, ProducerInfo> = {};
        (producers || []).forEach((p: any) => {
          if (p.id) producerMap[p.id] = p;
        });

        // Get all plans from these producers
        const { data: allPlans } = await supabase
          .from("plans")
          .select("id, name, price_num, is_free, collections_per_month, stripe_price_id, producer_id")
          .in("producer_id", producerIds)
          .eq("active", true);

        // Get collections for current month
        const now = new Date();
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const subIds = subs.map(s => s.id);
        const { data: allCollections } = await supabase
          .from("collections")
          .select("id, collected_at, month_year, subscriber_id")
          .in("subscriber_id", subIds)
          .eq("month_year", monthYear);

        // Build subscription cards
        const cards: SubscriptionCard[] = subs.map(sub => {
          const producer = producerMap[sub.producer_id] || {
            id: sub.producer_id, business_name: "Unknown Producer", accent_color: null, logo_url: null, url_slug: null,
          };
          const producerPlans = (allPlans || []).filter((p: any) => p.producer_id === sub.producer_id) as PlanInfo[];
          const currentPlan = producerPlans.find(p => p.name === sub.plan) || null;
          const availablePlans = producerPlans.filter(p => p.name !== sub.plan && !p.is_free);
          const collections = ((allCollections || []) as any[]).filter(c => c.subscriber_id === sub.id);

          return {
            subscriber: sub,
            producer,
            currentPlan,
            availablePlans,
            collections,
            collectionsTotal: currentPlan?.collections_per_month || 0,
          };
        });

        setSubscriptions(cards);

        // Get customer profile for name/phone
        const { data: custProfile } = await supabase
          .from("customer_profiles")
          .select("name, phone")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (custProfile) {
          setCustomerName(custProfile.name || "");
          setCustomerPhone(custProfile.phone || "");
        }
      } catch (err) {
        console.error("MyAccount fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session.isLoggedIn, session.supabaseUser?.id]);

  // Fetch invoices when payments tab is selected
  useEffect(() => {
    if (activeTab !== "payments" || invoices.length > 0 || invoicesLoading) return;
    const fetchInvoices = async () => {
      setInvoicesLoading(true);
      try {
        const { data } = await supabase.functions.invoke("get-customer-invoices");
        if (data?.invoices) setInvoices(data.invoices);
      } catch { /* ignore */ }
      setInvoicesLoading(false);
    };
    fetchInvoices();
  }, [activeTab]);

  const handleAction = async (action: "pause" | "resume" | "cancel", subscriberId: string) => {
    setActionLoading(`${action}-${subscriberId}`);
    try {
      const { data, error } = await supabase.functions.invoke("update-customer-subscription", {
        body: { action, subscriber_id: subscriberId },
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
      setSubscriptions(prev => prev.map(s =>
        s.subscriber.id === subscriberId
          ? { ...s, subscriber: { ...s.subscriber, status: action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled" } }
          : s
      ));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleChangePlan = async (subscriberId: string, newPlanId: string) => {
    setActionLoading(`change-${subscriberId}`);
    try {
      const { data, error } = await supabase.functions.invoke("update-customer-subscription", {
        body: { action: "change_plan", new_plan_id: newPlanId, subscriber_id: subscriberId },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Something went wrong");
        return;
      }
      toast.success("Plan changed successfully");
      // Refresh page to get updated data
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async (subscriberId: string) => {
    setPortalLoading(subscriberId);
    try {
      const { data, error } = await supabase.functions.invoke("create-customer-portal", {
        body: { return_url: `${window.location.origin}/my-account`, subscriber_id: subscriberId },
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Unable to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPortalLoading(null);
    }
  };

  const handlePasswordReset = async () => {
    const email = session.supabaseUser?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error("Failed to send reset email");
    else toast.success("Password reset email sent — check your inbox");
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await supabase
        .from("customer_profiles")
        .update({ name: customerName, phone: customerPhone || null } as any)
        .eq("user_id", session.supabaseUser!.id);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Cancel all active subscriptions
      for (const sub of subscriptions) {
        if (sub.subscriber.status === "active" && sub.subscriber.stripe_subscription_id) {
          await supabase.functions.invoke("update-customer-subscription", {
            body: { action: "cancel", subscriber_id: sub.subscriber.id },
          });
        }
      }
      await signOut();
      navigate("/", { replace: true });
      toast.success("Account deactivated. All subscriptions have been cancelled.");
    } catch {
      toast.error("Something went wrong");
    }
    setConfirmAction(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "subscriptions", label: "My Subscriptions", show: true },
    { key: "payments", label: "Payment History", show: true },
    { key: "collections", label: "Collections", show: hasCollections },
    { key: "settings", label: "Account", show: true },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <SlateLogo size={24} />
          <div className="flex items-center gap-4">
            {customerName && (
              <span className="text-sm text-muted-foreground hidden sm:block">{customerName}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome banner */}
        <AnimatePresence>
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center"
            >
              <p className="text-emerald-800 font-semibold">🎉 Subscription confirmed! Welcome aboard.</p>
              <p className="text-emerald-700 text-sm mt-1">
                We've sent you an email to set your password — check your inbox.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">My Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage all your subscriptions in one place</p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.filter(t => t.show).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "subscriptions" && (
          <SubscriptionsTab
            subscriptions={subscriptions}
            expandedSub={expandedSub}
            setExpandedSub={setExpandedSub}
            actionLoading={actionLoading}
            portalLoading={portalLoading}
            onAction={handleAction}
            onChangePlan={handleChangePlan}
            onPortal={handlePortal}
            onConfirm={setConfirmAction}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab invoices={invoices} loading={invoicesLoading} />
        )}

        {activeTab === "collections" && (
          <CollectionsTab subscriptions={subscriptions.filter(s => s.collectionsTotal > 0)} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            email={session.supabaseUser?.email || ""}
            name={customerName}
            phone={customerPhone}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
            onSave={handleSaveProfile}
            saving={savingProfile}
            onPasswordReset={handlePasswordReset}
            onDeleteAccount={() => setConfirmAction({ type: "delete_account" })}
          />
        )}
      </div>

      {/* Powered by Slate */}
      <div className="flex items-center justify-center gap-1.5 pb-10 opacity-40">
        <span className="text-xs text-muted-foreground">Powered by</span>
        <SlateLogo size={12} asLink={false} />
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction?.type === "pause"}
        onClose={() => setConfirmAction(null)}
        title="Pause subscription?"
        description="Your subscription will be paused. You won't be charged next month."
        confirmText={actionLoading ? "Pausing..." : "Pause Subscription"}
        onConfirm={() => confirmAction?.subId && handleAction("pause", confirmAction.subId)}
      />
      <ConfirmDialog
        open={confirmAction?.type === "cancel"}
        onClose={() => setConfirmAction(null)}
        title="Cancel subscription?"
        description="Your subscription will be cancelled at the end of the current billing period. You'll keep access until then."
        confirmText={actionLoading ? "Cancelling..." : "Cancel Subscription"}
        onConfirm={() => confirmAction?.subId && handleAction("cancel", confirmAction.subId)}
        destructive
      />
      <ConfirmDialog
        open={confirmAction?.type === "delete_account"}
        onClose={() => setConfirmAction(null)}
        title="Delete your account?"
        description="This will cancel all your subscriptions and deactivate your account. This cannot be undone."
        confirmText="Delete Account"
        onConfirm={handleDeleteAccount}
        destructive
      />
    </div>
  );
};

// ===== SUB-COMPONENTS =====

function SubscriptionsTab({
  subscriptions, expandedSub, setExpandedSub, actionLoading, portalLoading,
  onAction, onChangePlan, onPortal, onConfirm,
}: {
  subscriptions: SubscriptionCard[];
  expandedSub: string | null;
  setExpandedSub: (id: string | null) => void;
  actionLoading: string | null;
  portalLoading: string | null;
  onAction: (action: "pause" | "resume" | "cancel", subId: string) => void;
  onChangePlan: (subId: string, planId: string) => void;
  onPortal: (subId: string) => void;
  onConfirm: (action: { type: "pause" | "cancel"; subId: string } | null) => void;
}) {
  const navigate = useNavigate();

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-16">
        <Store className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">No subscriptions yet</h2>
        <p className="text-muted-foreground mb-6">You don't have any active subscriptions.</p>
        <Button variant="slate" onClick={() => navigate("/")}>
          Browse Producers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => {
        const s = sub.subscriber;
        const p = sub.producer;
        const isExpanded = expandedSub === s.id;
        const accent = p.accent_color || "#1E293B";

        const statusColor =
          s.status === "active" ? "bg-emerald-100 text-emerald-700" :
          s.status === "paused" ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700";

        return (
          <motion.div
            key={s.id}
            className="rounded-2xl border border-border bg-card overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                {p.logo_url ? (
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-border shrink-0">
                    <img src={p.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accent }}>
                    <span className="text-white font-bold text-base">{(p.business_name || "?").charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{p.business_name}</h3>
                  <p className="text-sm text-foreground">
                    {s.plan}
                    {sub.currentPlan && !sub.currentPlan.is_free && (
                      <span className="text-muted-foreground"> — £{sub.currentPlan.price_num}/mo</span>
                    )}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColor}`}>
                  {s.status}
                </span>
              </div>

              {/* Meta */}
              {s.current_period_end && s.status === "active" && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Next payment: {format(new Date(s.current_period_end), "d MMMM yyyy")}
                </p>
              )}
              {s.joined_at && (
                <p className="text-sm text-muted-foreground mb-3">Member since {s.joined_at}</p>
              )}

              {/* Collections mini */}
              {sub.collectionsTotal > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Collections: {sub.collections.length} of {sub.collectionsTotal} used this month
                </div>
              )}

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                {p.url_slug && (
                  <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
                    <a href={`/store/${p.url_slug}`} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="w-3.5 h-3.5" /> View Storefront
                    </a>
                  </Button>
                )}
                <Button
                  size="sm" variant="outline" className="text-xs gap-1.5"
                  onClick={() => setExpandedSub(isExpanded ? null : s.id)}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage
                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Expanded management panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-border bg-muted/30 space-y-4">
                    {/* Change plan */}
                    {sub.availablePlans.length > 0 && s.status === "active" && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Change Plan</p>
                        <div className="flex flex-wrap gap-2">
                          {sub.availablePlans.map(plan => (
                            <Button
                              key={plan.id}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              disabled={!!actionLoading}
                              onClick={() => onChangePlan(s.id, plan.id)}
                            >
                              {actionLoading === `change-${s.id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              {plan.name} — £{plan.price_num}/mo
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subscription actions */}
                    <div className="flex flex-wrap gap-2">
                      {s.status === "active" && (
                        <>
                          <Button
                            size="sm" variant="outline" className="text-xs gap-1.5"
                            onClick={() => onConfirm({ type: "pause", subId: s.id })}
                            disabled={!!actionLoading}
                          >
                            <Pause className="w-3.5 h-3.5" /> Pause Subscription
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => onConfirm({ type: "cancel", subId: s.id })}
                            disabled={!!actionLoading}
                          >
                            <X className="w-3.5 h-3.5" /> Cancel Subscription
                          </Button>
                        </>
                      )}
                      {s.status === "paused" && (
                        <Button
                          size="sm" variant="outline" className="text-xs gap-1.5"
                          onClick={() => onAction("resume", s.id)}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === `resume-${s.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          Resume Subscription
                        </Button>
                      )}
                    </div>

                    {/* Payment method */}
                    {s.stripe_customer_id && (
                      <Button
                        size="sm" variant="outline" className="text-xs gap-1.5"
                        onClick={() => onPortal(s.id)}
                        disabled={portalLoading === s.id}
                      >
                        {portalLoading === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        Update Payment Method
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function PaymentsTab({ invoices, loading }: { invoices: InvoiceInfo[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16">
        <Receipt className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">No payments yet</h2>
        <p className="text-muted-foreground">Your payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="divide-y divide-border">
        {invoices.map((inv, i) => {
          const statusColor =
            inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
            inv.status === "open" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700";

          return (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <div className="flex-1 min-w-0">
                <span className="text-foreground font-medium">{format(new Date(inv.date), "d MMM yyyy")}</span>
                <span className="text-muted-foreground ml-2">{inv.producer_name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-foreground font-medium">£{(inv.amount / 100).toFixed(2)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                  {inv.status}
                </span>
                {inv.invoice_url && (
                  <a href={inv.invoice_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollectionsTab({ subscriptions }: { subscriptions: SubscriptionCard[] }) {
  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => {
        const used = sub.collections.length;
        const total = sub.collectionsTotal;
        const accent = sub.producer.accent_color || "#1E293B";

        return (
          <motion.div
            key={sub.subscriber.id}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-foreground">{sub.producer.business_name}</h3>
              <span className="text-sm text-muted-foreground">— {sub.subscriber.plan}</span>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">{used} of {total} used this month</p>

            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (used / total) * 100)}%`, backgroundColor: accent }}
              />
            </div>

            {sub.collections.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {sub.collections.map(c => (
                  <p key={c.id} className="text-sm text-muted-foreground">
                    ✓ Collected — {format(new Date(c.collected_at), "EEEE d MMMM")}
                  </p>
                ))}
              </div>
            )}
            {used < total && (
              <p className="text-sm text-muted-foreground">{total - used} remaining this month</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">Collections reset on the 1st of each month</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function SettingsTab({
  email, name, phone, onNameChange, onPhoneChange, onSave, saving, onPasswordReset, onDeleteAccount,
}: {
  email: string;
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  onPasswordReset: () => void;
  onDeleteAccount: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => onNameChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
            <p className="text-sm text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Contact sales@slatetech.co.uk to change your email</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => onPhoneChange(e.target.value)}
              placeholder="Optional"
              className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <Button size="sm" variant="slate" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4" /> Security
        </h2>
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={onPasswordReset}>
          Change Password <ChevronRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/20 bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-destructive mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete Account
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          This will cancel all your subscriptions and delete your account. This cannot be undone.
        </p>
        <Button size="sm" variant="destructive" className="text-xs" onClick={onDeleteAccount}>
          Delete My Account
        </Button>
      </div>
    </div>
  );
}

export default MyAccount;
