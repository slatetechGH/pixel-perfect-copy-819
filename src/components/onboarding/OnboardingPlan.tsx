import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  onContinue: () => void;
  onSkip: () => void;
}

export default function OnboardingPlan({ userId, onContinue, onSkip }: Props) {
  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState("");
  const [benefits, setBenefits] = useState(["", "", ""]);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const priceNum = parseFloat(price) || 0;
  const stripeFee = priceNum > 0 ? priceNum * 0.022 + 0.3 : 0;
  const slateFee = priceNum * 0.06;
  const earnings = Math.max(0, priceNum - stripeFee - slateFee);

  const addBenefit = () => setBenefits(prev => [...prev, ""]);
  const removeBenefit = (i: number) => setBenefits(prev => prev.filter((_, idx) => idx !== i));
  const updateBenefit = (i: number, val: string) => setBenefits(prev => prev.map((b, idx) => idx === i ? val : b));

  const handleCreate = async () => {
    if (!planName.trim()) { toast.error("Plan name is required"); return; }
    if (priceNum <= 0) { toast.error("Price must be greater than 0"); return; }
    setSaving(true);
    const filteredBenefits = benefits.filter(b => b.trim());
    const { error } = await supabase.from("plans").insert({
      name: planName,
      price_num: priceNum,
      benefits: filteredBenefits.length > 0 ? filteredBenefits : null,
      producer_id: userId,
      active: true,
      show_on_public_page: true,
    });
    if (error) {
      toast.error("Failed to create plan");
      setSaving(false);
      return;
    }
    await supabase.from("profiles").update({ onboarding_step: 4 } as any).eq("id", userId);
    setSaving(false);
    setCreated(true);
    toast.success("Plan created!");
  };

  const inputCls = "w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all";

  if (created) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto text-center"
      >
        <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-amber text-xl">✓</span>
        </div>
        <h2 className="text-[24px] font-bold text-foreground mb-2">Nice! Want to add another?</h2>
        <p className="text-[15px] text-muted-foreground mb-6">Most producers have 2-3 tiers for different budgets.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => {
            setCreated(false);
            setPlanName("");
            setPrice("");
            setBenefits(["", "", ""]);
          }}>
            Add another plan
          </Button>
          <Button variant="slate" onClick={onContinue}>Continue →</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <h1 className="text-[28px] md:text-[32px] font-bold text-foreground tracking-[-0.01em] mb-1 text-center">
        Create your first subscription plan
      </h1>
      <p className="text-[16px] text-muted-foreground mb-8 text-center">
        What will your customers get each month? You can always add more plans later.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Plan Name <span className="text-amber">*</span></label>
            <input value={planName} onChange={e => setPlanName(e.target.value)} className={inputCls} placeholder="e.g. The Weekly Box" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Monthly Price <span className="text-amber">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[15px]">£</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className={inputCls + " pl-8"}
                placeholder="25.00"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Benefits</label>
            <div className="space-y-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={b}
                    onChange={e => updateBenefit(i, e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 10% in-store discount"
                  />
                  {benefits.length > 1 && (
                    <button onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addBenefit} className="text-[13px] text-amber hover:text-amber/80 flex items-center gap-1 cursor-pointer">
                <Plus size={14} /> Add another
              </button>
            </div>
          </div>
        </div>

        {/* Live preview + earnings */}
        <div className="space-y-4">
          <div className="bg-secondary rounded-xl border border-border p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
            <h3 className="text-[18px] font-bold text-foreground mb-1">{planName || "Plan Name"}</h3>
            <p className="text-[24px] font-bold text-foreground">£{priceNum > 0 ? priceNum.toFixed(2) : "0.00"}<span className="text-[14px] font-normal text-muted-foreground">/mo</span></p>
            {benefits.filter(b => b.trim()).length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {benefits.filter(b => b.trim()).map((b, i) => (
                  <li key={i} className="text-[14px] text-muted-foreground flex items-start gap-2">
                    <span className="text-amber mt-0.5">•</span> {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {priceNum > 0 && (
            <div className="bg-amber/5 rounded-lg border border-amber/20 p-4 text-[14px] text-foreground">
              At £{priceNum.toFixed(2)}/mo, you'll earn approximately <strong>£{earnings.toFixed(2)}</strong> per subscriber after fees.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button variant="slate" className="w-full h-11 text-[15px]" onClick={handleCreate} disabled={saving}>
          {saving ? "Creating..." : "Create plan →"}
        </Button>
        <button onClick={onSkip} className="w-full text-center text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          I'll set up plans later
        </button>
      </div>
    </motion.div>
  );
}
