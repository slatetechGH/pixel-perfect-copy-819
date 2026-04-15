import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Check, Trash2, Lock, Tag, Copy } from "lucide-react";
import { useDashboard, Plan } from "@/contexts/DashboardContext";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PriceCalculator } from "@/components/commission/PriceCalculator";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { useTierLimits } from "@/hooks/useTierLimits";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyPlan: Omit<Plan, "id"> = {
  name: "", price: "Free", priceNum: 0, subscribers: 0, isFree: false,
  benefits: [""], description: "", active: true, showOnPublicPage: true, collectionsPerMonth: 0,
};

const Plans = () => {
  const { plans, setPlans, savePlan, removePlan } = useDashboard();
  const { isFree, isAtPlanLimit } = useTierLimits();
  const { session, demoActive } = useApp();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Plan | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  // Discount codes state
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [dcCode, setDcCode] = useState("");
  const [dcType, setDcType] = useState<"percentage" | "fixed">("percentage");
  const [dcValue, setDcValue] = useState("");
  const [dcMaxUses, setDcMaxUses] = useState("");
  const [dcExpires, setDcExpires] = useState("");
  const [dcSaving, setDcSaving] = useState(false);

  // Fetch discount codes
  useEffect(() => {
    if (!session.supabaseUser?.id || demoActive) return;
    supabase
      .from("discount_codes")
      .select("*")
      .eq("producer_id", session.supabaseUser.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setDiscountCodes(data as DiscountCode[]);
      });
  }, [session.supabaseUser?.id, demoActive]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setDcCode(code);
  };

  const saveDiscount = async () => {
    if (!dcCode || !dcValue || !session.supabaseUser?.id) {
      toast.error("Code and value are required");
      return;
    }
    setDcSaving(true);
    const { data, error } = await supabase.from("discount_codes").insert({
      producer_id: session.supabaseUser.id,
      code: dcCode.toUpperCase(),
      discount_type: dcType,
      discount_value: parseInt(dcValue),
      max_uses: dcMaxUses ? parseInt(dcMaxUses) : null,
      expires_at: dcExpires || null,
    } as any).select().single();
    if (error) {
      toast.error("Failed to create discount code");
    } else if (data) {
      setDiscountCodes(prev => [data as DiscountCode, ...prev]);
      toast.success("Discount code created! Remember to also create this code in your Stripe Dashboard → Coupons to enable it at checkout.");
      setShowDiscountForm(false);
      setDcCode(""); setDcValue(""); setDcMaxUses(""); setDcExpires("");
    }
    setDcSaving(false);
  };

  const toggleDiscount = async (dc: DiscountCode) => {
    await supabase.from("discount_codes").update({ active: !dc.active } as any).eq("id", dc.id);
    setDiscountCodes(prev => prev.map(d => d.id === dc.id ? { ...d, active: !d.active } : d));
    toast.success(dc.active ? "Code deactivated" : "Code activated");
  };

  const deleteDiscount = async (dc: DiscountCode) => {
    await supabase.from("discount_codes").delete().eq("id", dc.id);
    setDiscountCodes(prev => prev.filter(d => d.id !== dc.id));
    toast.success("Code deleted");
  };

  const openEditor = (plan?: Plan) => {
    if (!plan && isFree && isAtPlanLimit) {
      toast("Free tier includes 3 plans. Upgrade to Standard to create unlimited plans.");
      return;
    }
    if (plan) {
      setEditing({ ...plan, benefits: [...plan.benefits] });
      setPriceInput(plan.priceNum > 0 ? String(plan.priceNum) : "");
      setIsNew(false);
    } else {
      setEditing({ ...emptyPlan, id: crypto.randomUUID(), benefits: [""] } as Plan);
      setPriceInput("");
      setIsNew(true);
    }
  };

  const updateField = (field: keyof Plan, value: any) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const updateBenefit = (index: number, value: string) => {
    if (!editing) return;
    const b = [...editing.benefits];
    b[index] = value;
    setEditing({ ...editing, benefits: b });
  };

  const removeBenefit = (index: number) => {
    if (!editing || editing.benefits.length <= 1) return;
    setEditing({ ...editing, benefits: editing.benefits.filter((_, i) => i !== index) });
  };

const save = async () => {
    if (!editing || !editing.name) { toast.error("Plan name is required"); return; }
    setSaving(true);
    const updated = { ...editing, price: editing.priceNum === 0 ? "Free" : `£${editing.priceNum}/mo`, isFree: editing.priceNum === 0 };
    await savePlan(updated);
    setSaving(false);
    setEditing(null);
  };

  const deletePlan = async (plan: Plan) => {
    await removePlan(plan.id);
    setEditing(null);
  };

 const toggleActive = async (plan: Plan) => {
    const updated = { ...plan, active: !plan.active };
    await savePlan(updated);
  };

  return (
    <DashboardLayout
      title="Plans"
      subtitle="Manage your membership tiers"
      actions={
        isFree && isAtPlanLimit ? (
          <Button size="sm" variant="outline" onClick={() => openEditor()}>
            <Lock className="h-4 w-4 mr-1.5" /> Create Plan
          </Button>
        ) : (
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-1.5" /> Create Plan</Button>
        )
      }
    >
      {isFree && isAtPlanLimit && (
        <UpgradeBanner message="You've reached the 3-plan limit. Upgrade to Standard for unlimited plans." />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            {plan.priceNum === 35 && (
              <div className="absolute top-0 right-0 bg-foreground text-white text-[11px] font-medium px-3 py-1 rounded-bl-lg">Popular</div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-medium">{plan.name}</CardTitle>
              <p className="text-metric text-foreground">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 mb-4 text-[13px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{plan.subscribers} subscribers</span>
              </div>
              {plan.collectionsPerMonth > 0 && (
                <p className="text-[13px] text-muted-foreground mb-2">{plan.collectionsPerMonth} collections/month</p>
              )}
              {plan.collectionsPerMonth === 0 && plan.priceNum > 0 && (
                <p className="text-[13px] text-muted-foreground mb-2">Digital only</p>
              )}
              <ul className="space-y-2.5 mb-5">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />{b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditor(plan)}>Edit</Button>
                <button
                  onClick={() => setToggleConfirm(plan)}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium cursor-pointer transition-colors ${
                    plan.active ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.active ? "Active" : "Inactive"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add plan card */}
        <button
          onClick={() => openEditor()}
          className="border-2 border-dashed border-border rounded-[14px] flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-muted-foreground/40 transition-colors cursor-pointer"
        >
          <Plus size={32} className="text-muted-foreground" />
          <span className="text-[15px] font-medium text-muted-foreground">Create new plan</span>
        </button>
      </div>

      {/* Discount Codes Section */}
      {!demoActive && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground">Discount Codes</h2>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setShowDiscountForm(true); generateCode(); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Code
            </Button>
          </div>

          {showDiscountForm && (
            <Card className="mb-4 border-0 shadow-card">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Code</label>
                    <div className="flex gap-2">
                      <input
                        value={dcCode}
                        onChange={e => setDcCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FRESH20"
                        className="flex-1 h-11 px-4 rounded-lg border border-border bg-white text-[16px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                      />
                      <Button size="sm" variant="outline" onClick={generateCode} className="min-h-[44px]">Generate</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Discount Type</label>
                    <select
                      value={dcType}
                      onChange={e => setDcType(e.target.value as "percentage" | "fixed")}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                    >
                      <option value="percentage">Percentage off</option>
                      <option value="fixed">Fixed amount off (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">
                      Value ({dcType === "percentage" ? "%" : "£"})
                    </label>
                    <input
                      type="number"
                      value={dcValue}
                      onChange={e => setDcValue(e.target.value)}
                      placeholder={dcType === "percentage" ? "e.g. 20" : "e.g. 5"}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[16px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Max Uses (optional)</label>
                    <input
                      type="number"
                      value={dcMaxUses}
                      onChange={e => setDcMaxUses(e.target.value)}
                      placeholder="Leave blank for unlimited"
                      className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[16px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Expires (optional)</label>
                    <input
                      type="date"
                      value={dcExpires}
                      onChange={e => setDcExpires(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[16px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Also create this code in your <strong>Stripe Dashboard → Coupons</strong> to enable it at checkout.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDiscountForm(false)}>Cancel</Button>
                  <Button variant="slate" onClick={saveDiscount} disabled={dcSaving}>
                    {dcSaving ? "Creating..." : "Create Code"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {discountCodes.length > 0 ? (
            <div className="space-y-2">
              {discountCodes.map(dc => (
                <Card key={dc.id} className="border-0 shadow-card">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <code className="text-sm font-bold text-foreground bg-muted px-2 py-1 rounded">{dc.code}</code>
                      <span className="text-sm text-muted-foreground">
                        {dc.discount_type === "percentage" ? `${dc.discount_value}% off` : `£${dc.discount_value} off`}
                      </span>
                      {dc.max_uses && (
                        <span className="text-xs text-muted-foreground">{dc.current_uses}/{dc.max_uses} used</span>
                      )}
                      {dc.expires_at && new Date(dc.expires_at) < new Date() && (
                        <span className="text-xs text-destructive font-medium">Expired</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(dc.code); toast.success("Code copied!"); }}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleDiscount(dc)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          dc.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {dc.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => deleteDiscount(dc)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !showDiscountForm && (
            <p className="text-sm text-muted-foreground">No discount codes yet. Create one to offer promotions to your customers.</p>
          )}
        </div>
      )}

      {/* Editor Slide-Over */}
      <SlideOverPanel open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Create Plan" : "Edit Plan"}>
        {editing && (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Plan Name <span className="text-amber">*</span></label>
              <input value={editing.name} onChange={e => updateField("name", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Monthly Price (£) <span className="text-amber">*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-muted-foreground">£</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                      setPriceInput(val);
                      updateField("priceNum", parseFloat(val) || 0);
                    }
                  }}
                  placeholder="e.g. 25.00"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                />
              </div>
              <PriceCalculator priceNum={editing.priceNum} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Description</label>
              <textarea value={editing.description} onChange={e => updateField("description", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Features / Benefits</label>
              <div className="space-y-2">
                {editing.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={b} onChange={e => updateBenefit(i, e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                    {editing.benefits.length > 1 && (
                      <button onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEditing({ ...editing, benefits: [...editing.benefits, ""] })} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">+ Add feature</button>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Collections per month</label>
              <input type="number" min="0" value={editing.collectionsPerMonth || ""} onChange={e => updateField("collectionsPerMonth", e.target.value ? parseInt(e.target.value) : 0)} placeholder="e.g. 4" className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              <p className="text-[12px] text-muted-foreground mt-1">How many times can a subscriber collect goods each month? Set to 0 for digital-only plans.</p>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Subscriber Limit</label>
              <input type="number" value={editing.subscriberLimit || ""} onChange={e => updateField("subscriberLimit", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Leave blank for unlimited" className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.showOnPublicPage} onChange={e => updateField("showOnPublicPage", e.target.checked)} className="w-[18px] h-[18px] rounded accent-foreground" />
              <span className="text-[14px] text-foreground">Show on public page</span>
            </label>

            <div className="border-t border-border pt-5 mt-6 flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="slate" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
              </div>
            </div>
            {!isNew && (
              <button onClick={() => setDeleteConfirm(editing)} className="text-[13px] text-destructive/80 hover:text-destructive transition-colors cursor-pointer">
                Delete plan
              </button>
            )}
          </div>
        )}
      </SlideOverPanel>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deletePlan(deleteConfirm)}
        title="Delete plan"
        description={`This will permanently delete "${deleteConfirm?.name}". ${deleteConfirm?.subscribers || 0} subscribers will need to be migrated.`}
        confirmText="Delete plan"
        destructive
      />
      <ConfirmDialog
        open={!!toggleConfirm}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => toggleConfirm && toggleActive(toggleConfirm)}
        title={toggleConfirm?.active ? "Deactivate plan" : "Activate plan"}
        description={`${toggleConfirm?.active ? "Deactivating" : "Activating"} "${toggleConfirm?.name}" will ${toggleConfirm?.active ? "hide it from new subscribers" : "make it available to new subscribers"}.`}
        confirmText={toggleConfirm?.active ? "Deactivate" : "Activate"}
      />
    </DashboardLayout>
  );
};

export default Plans;
