import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { useTierLimits } from "@/hooks/useTierLimits";
import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const freeFeatures = [
  { label: "Up to 25 subscribers", included: true },
  { label: "1 subscription plan", included: true },
  { label: "Up to 50 contacts", included: true },
  { label: "3 broadcasts/month", included: true },
  { label: "Branded storefront", included: true },
  { label: "Collection tracking", included: true },
  { label: "Product drops", included: false },
  { label: "Unlimited plans", included: false },
  { label: "Automated reminders", included: false },
  { label: "Phone support", included: false },
];

const standardFeatures = [
  { label: "Unlimited subscribers", included: true },
  { label: "Unlimited plans", included: true },
  { label: "Unlimited contacts", included: true },
  { label: "Unlimited broadcasts", included: true },
  { label: "Branded storefront", included: true },
  { label: "Collection tracking", included: true },
  { label: "Product drops", included: true },
  { label: "Content gating", included: true },
  { label: "Automated reminders", included: true },
  { label: "Phone & email support", included: true },
];

const Upgrade = () => {
  const { isFree, isStandard, commissionPercent } = useTierLimits();
  const { session } = useApp();
  const { kpiData } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const mrr = parseFloat(kpiData.mrr.replace(/[^0-9.]/g, "")) || 0;

  // Commission savings calculation
  const freeCommission = mrr * 0.08;
  const standardCost = 39 + mrr * 0.05;
  const savings = freeCommission - standardCost;
  const savingsMessage = savings > 0
    ? `Save £${savings.toFixed(0)}/month on commission`
    : "As your subscribers grow, Standard pays for itself.";

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Welcome to Standard! All limits have been removed.");
    }
    if (searchParams.get("cancelled") === "true") {
      toast("Upgrade cancelled. You're still on the Free plan.");
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-producer-checkout", {
        body: {
          success_url: `${window.location.origin}/dashboard/upgrade?success=true`,
          cancel_url: `${window.location.origin}/dashboard/upgrade?cancelled=true`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Failed to create checkout session");
      }
    } catch (err) {
      toast.error("Failed to start upgrade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Upgrade" subtitle="Choose the right plan for your business">
      {isStandard && (
        <div className="flex items-center gap-2 px-5 py-4 rounded-xl bg-success/10 border border-success/20 mb-6">
          <Check className="h-5 w-5 text-success" />
          <p className="text-[14px] text-foreground">You're on the <span className="font-semibold">Standard</span> plan. All limits are removed.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Free Card */}
        <Card className={`border-0 shadow-card ${isFree ? "ring-2 ring-foreground" : ""}`}>
          <CardContent className="p-8">
            {isFree && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-foreground text-white mb-4">
                Current Plan
              </span>
            )}
            <h3 className="text-[20px] font-bold text-foreground mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[36px] font-bold text-foreground">£0</span>
              <span className="text-[15px] text-muted-foreground">/month</span>
            </div>
            <p className="text-[14px] text-amber font-medium mb-6">8% commission</p>

            <ul className="space-y-3 mb-6">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-[14px]">
                  {f.included ? (
                    <Check className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>{f.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Standard Card */}
        <Card className={`border-0 shadow-card relative ${isStandard ? "ring-2 ring-foreground" : ""}`}>
          {!isStandard && (
            <div className="absolute top-0 right-0 bg-amber text-white text-[11px] font-medium px-3 py-1 rounded-bl-lg">
              Recommended
            </div>
          )}
          <CardContent className="p-8">
            {isStandard && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-foreground text-white mb-4">
                Current Plan
              </span>
            )}
            <h3 className="text-[20px] font-bold text-foreground mb-1">Standard</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[36px] font-bold text-foreground">£39</span>
              <span className="text-[15px] text-muted-foreground">/month</span>
            </div>
            <p className="text-[14px] text-success font-medium mb-6">5% commission</p>

            <ul className="space-y-3 mb-6">
              {standardFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-[14px]">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  <span className="text-foreground">{f.label}</span>
                </li>
              ))}
            </ul>

            {isFree && (
              <>
                <Button
                  variant="slate"
                  className="w-full h-12 text-[15px] mb-3"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Upgrade to Standard</>
                  )}
                </Button>
                <p className="text-[13px] text-muted-foreground text-center">{savingsMessage}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-[14px] text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
        Both plans include: branded storefront, custom branding, subscriber management, analytics, and collection tracking.
      </p>
    </DashboardLayout>
  );
};

export default Upgrade;
