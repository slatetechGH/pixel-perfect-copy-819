import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Instagram, Globe, Twitter, Facebook, Upload, Eye, Loader2, CreditCard, X, Copy, Sparkles } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useTierLimits } from "@/hooks/useTierLimits";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const tabs = ["Business Profile", "Public Page", "Notifications", "Billing & Payments"] as const;
const accentSwatches = ["#1E293B", "#475569", "#0F172A", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

const Settings = () => {
  const { settings, setSettings } = useDashboard();
  const { setSession } = useApp();
  const { isFree, isStandard, commissionPercent } = useTierLimits();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Business Profile");
  const [saving, setSaving] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "" });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Profile updated"); }, 500);
  };

  const updateField = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key as keyof typeof prev.notifications] },
    }));
    toast.success("Notification preference updated");
  };

  const handleFileUpload = (setter: (url: string | null) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setter(url);
        toast.success("Image uploaded");
      }
    };
    input.click();
  };

  const handleSaveCard = () => {
    if (newCard.number.length >= 4) {
      const last4 = newCard.number.replace(/\s/g, "").slice(-4);
      setSettings(prev => ({ ...prev, cardLast4: last4 }));
      setCardModal(false);
      setNewCard({ number: "", expiry: "", cvc: "" });
      toast.success("Payment method updated");
    }
  };

  const inputCls = "w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all";

  return (
    <DashboardLayout title="Settings" subtitle="Business profile & configuration">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-[14px] font-medium transition-colors cursor-pointer border-b-2 ${activeTab === tab ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {activeTab === "Business Profile" && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Name</label><input value={settings.businessName} onChange={e => updateField("businessName", e.target.value)} className={inputCls} /></div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Type</label>
                  <select value={settings.businessType} onChange={e => updateField("businessType", e.target.value)} className={inputCls + " appearance-none"}>
                    {["Fishmonger", "Butcher", "Baker", "Cheesemaker", "Farm Shop", "Brewery / Distillery"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Description</label><textarea value={settings.description} onChange={e => updateField("description", e.target.value)} rows={3} className={inputCls + " h-auto py-3 resize-none"} /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Email</label><input value={settings.email} onChange={e => updateField("email", e.target.value)} className={inputCls} /></div>
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Phone</label><input value={settings.phone} onChange={e => updateField("phone", e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Website</label><div className="flex items-center gap-2"><Globe size={16} className="text-muted-foreground shrink-0" /><input value={settings.website} onChange={e => updateField("website", e.target.value)} className={inputCls} /></div></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5 flex items-center gap-1"><Instagram size={14} /> Instagram</label><input value={settings.instagram} onChange={e => updateField("instagram", e.target.value)} className={inputCls} /></div>
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5 flex items-center gap-1"><Facebook size={14} /> Facebook</label><input value={settings.facebook} onChange={e => updateField("facebook", e.target.value)} className={inputCls} /></div>
                <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5 flex items-center gap-1"><Twitter size={14} /> X / Twitter</label><input value={settings.twitter} onChange={e => updateField("twitter", e.target.value)} className={inputCls} /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Logo</label>
                  <div
                    onClick={() => handleFileUpload(setLogoUrl)}
                    className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground/30 transition-colors cursor-pointer overflow-hidden"
                  >
                    {logoUrl ? <img src={logoUrl} className="h-full w-full object-cover" alt="Logo" /> : <><Upload size={20} className="mr-2" /> Upload</>}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Cover Photo</label>
                  <div
                    onClick={() => handleFileUpload(setCoverUrl)}
                    className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground/30 transition-colors cursor-pointer overflow-hidden"
                  >
                    {coverUrl ? <img src={coverUrl} className="h-full w-full object-cover" alt="Cover" /> : <><Upload size={20} className="mr-2" /> Upload</>}
                  </div>
                </div>
              </div>
              <Button variant="slate" onClick={save} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "Public Page" && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Custom URL</label>
                <div className="flex items-center">
                  <span className="h-11 px-3 bg-secondary rounded-l-lg border border-r-0 border-border flex items-center text-[14px] text-muted-foreground">slatetech.co.uk/store/</span>
                  <input
                    value={settings.urlSlug}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                      updateField("urlSlug", val);
                    }}
                    className={inputCls + " rounded-l-none rounded-r-none"}
                  />
                  <button
                    onClick={() => {
                      const slug = settings.urlSlug || settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      navigator.clipboard.writeText(`https://slatetech.co.uk/store/${slug}`);
                      toast.success("Storefront URL copied!");
                    }}
                    className="h-11 px-3 bg-secondary rounded-r-lg border border-l-0 border-border flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-[14px] font-medium text-foreground">Visibility</p><p className="text-[13px] text-muted-foreground">Make your page publicly accessible</p></div>
                <button onClick={() => updateField("publicVisible", !settings.publicVisible)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${settings.publicVisible ? "bg-foreground" : "bg-muted-foreground/30"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.publicVisible ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                </button>
              </div>
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-2">Accent Colour</label>
                <div className="flex gap-2 flex-wrap">
                  {accentSwatches.map(c => (
                    <button key={c} onClick={() => updateField("accentColor", c)} className={`w-8 h-8 rounded-full transition-all cursor-pointer ${settings.accentColor === c ? "ring-2 ring-foreground ring-offset-2" : ""}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <Button variant="outline" onClick={() => toast("Preview coming soon")}><Eye size={16} className="mr-1.5" /> Preview public page</Button>
              <Button variant="slate" onClick={save} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "Notifications" && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-1">
              {[
                { key: "newSubscriber", label: "New subscriber", desc: "Get notified when someone subscribes" },
                { key: "cancellation", label: "Cancellation", desc: "Get notified when a subscriber cancels" },
                { key: "dropSoldOut", label: "Drop sold out", desc: "Get notified when a product drop sells out" },
                { key: "newMessage", label: "New message", desc: "Get notified when you receive a message" },
                { key: "weeklyRevenue", label: "Weekly revenue summary", desc: "Receive a weekly email with your revenue stats" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div><p className="text-[14px] font-medium text-foreground">{n.label}</p><p className="text-[13px] text-muted-foreground">{n.desc}</p></div>
                  <button onClick={() => toggleNotification(n.key)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${settings.notifications[n.key as keyof typeof settings.notifications] ? "bg-foreground" : "bg-muted-foreground/30"}`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.notifications[n.key as keyof typeof settings.notifications] ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "Billing & Payments" && (
          <div className="space-y-5">
            {/* Stripe Connect */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Accept Payments</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                {settings.stripeConnectStatus === "active" ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-success/10 text-success">Stripe connected ✓</span>
                    <p className="text-[13px] text-muted-foreground">You can accept payments from subscribers.</p>
                  </div>
                ) : settings.stripeConnectStatus === "connecting" ? (
                  <div>
                    <p className="text-[14px] text-foreground mb-2">Stripe setup in progress</p>
                    <p className="text-[13px] text-muted-foreground mb-3">Complete your Stripe onboarding to start accepting payments.</p>
                    <Button variant="slate" onClick={async () => {
                      const { data } = await supabase.functions.invoke("stripe-connect-onboarding", { body: { action: "create_account" } });
                      if (data?.url) window.location.href = data.url;
                      else toast.error("Failed to resume Stripe setup");
                    }}>
                      Resume Setup
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[14px] text-foreground mb-2">Connect your Stripe account to start accepting payments</p>
                    <p className="text-[13px] text-muted-foreground mb-3">Stripe handles all payment processing securely. Slate takes a {commissionPercent}% commission on subscription revenue.</p>
                    <Button variant="slate" onClick={async () => {
                      const { data } = await supabase.functions.invoke("stripe-connect-onboarding", { body: { action: "create_account" } });
                      if (data?.url) window.location.href = data.url;
                      else toast.error("Failed to start Stripe setup");
                    }}>
                      <CreditCard size={16} className="mr-1.5" /> Connect Stripe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slate Plan */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Your Slate Plan</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                {isFree ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-secondary text-foreground">Free</span>
                    </div>
                    <p className="text-[14px] text-muted-foreground mb-4">8% commission on subscriber revenue</p>
                    <Button variant="slate" onClick={() => navigate("/dashboard/upgrade")}>
                      <Sparkles className="h-4 w-4 mr-1.5" /> Upgrade to Standard →
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber/10 text-amber">Standard</span>
                      <span className="text-[15px] font-semibold text-foreground">£39/month</span>
                    </div>
                    <p className="text-[14px] text-muted-foreground mb-4">5% commission on subscriber revenue</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        disabled={portalLoading}
                        onClick={async () => {
                          setPortalLoading(true);
                          try {
                            const { data, error } = await supabase.functions.invoke("create-billing-portal");
                            if (data?.url) window.location.href = data.url;
                            else toast.error(data?.error || "Failed to open billing portal");
                          } catch {
                            toast.error("Failed to open billing portal");
                          } finally {
                            setPortalLoading(false);
                          }
                        }}
                      >
                        {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                        Manage subscription
                      </Button>
                      <button
                        onClick={() => setCancelConfirm(true)}
                        className="text-[13px] text-destructive/80 hover:text-destructive cursor-pointer"
                      >
                        Downgrade to Free
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Card update modal */}
      {cardModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCardModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-[400px] w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-foreground flex items-center gap-2"><CreditCard size={20} /> Update Payment Method</h3>
              <button onClick={() => setCardModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Card Number</label>
                <input value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} placeholder="•••• •••• •••• ••••" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Expiry</label>
                  <input value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="MM/YY" className={inputCls} />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">CVC</label>
                  <input value={newCard.cvc} onChange={e => setNewCard({ ...newCard, cvc: e.target.value })} placeholder="•••" type="password" className={inputCls} />
                </div>
              </div>
              <Button variant="slate" className="w-full" onClick={handleSaveCard}>Save card</Button>
            </div>
          </div>
        </div>
      )}

      )}

      <ConfirmDialog
        open={cancelConfirm}
        onClose={() => setCancelConfirm(false)}
        onConfirm={() => { setCancelConfirm(false); toast("Your plan will remain active until the end of your billing period."); }}
        title={isStandard ? "Downgrade to Free?" : "Cancel your plan?"}
        description={isStandard ? "Are you sure? You'll lose access to unlimited subscribers, plans, and broadcasts. Your existing data will be preserved but limits will be enforced." : "Are you sure? You'll lose access at the end of your billing period."}
        confirmText={isStandard ? "Downgrade" : "Cancel plan"}
        destructive
      />
    </DashboardLayout>
  );
};

export default Settings;
