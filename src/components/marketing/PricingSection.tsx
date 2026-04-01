import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const freeFeatures = [
  "25 customers",
  "3 subscription plans",
  "Branded store page",
  "Collection tracking",
  "3 email updates/month",
];

const standardFeatures = [
  "Unlimited customers",
  "Unlimited plans",
  "Unlimited email updates",
  "Limited releases",
  "Members-only content",
  "Automated reminders",
  "Priority support",
];

const sharedFeatures = [
  "Branded store page",
  "Custom branding",
  "Customer management",
  "Reports & insights",
  "Collection tracking",
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 md:py-32 bg-secondary">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <AnimatedSection>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3 text-center">
            Pricing
          </p>
          <h2 className="text-[28px] md:text-[48px] font-bold text-foreground leading-tight tracking-[-0.02em] mb-4 text-center">
            Simple, transparent pricing.
          </h2>
          <p className="text-[18px] md:text-[20px] text-slate-mid text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            No risk. Start free. Upgrade when you're ready.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Card */}
            <div className="bg-white rounded-2xl shadow-card p-8">
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[48px] font-bold text-foreground leading-none">£0</span>
                <span className="text-[16px] text-slate-mid">/month</span>
              </div>
              <p className="text-[14px] text-amber font-medium mb-1">8% commission</p>
              <p className="text-[14px] text-slate-mid mb-6">Perfect for getting started</p>

              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-foreground">
                    <Check size={16} className="text-amber shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="slate"
                className="w-full h-12 text-[15px]"
                onClick={() => navigate("/get-started")}
              >
                Get started free
              </Button>
            </div>

            {/* Standard Card */}
            <div className="bg-white rounded-2xl shadow-card p-8 relative">
              <div className="absolute top-0 right-0 bg-amber text-white text-[11px] font-medium px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Standard</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[48px] font-bold text-foreground leading-none">£39</span>
                <span className="text-[16px] text-slate-mid">/month</span>
              </div>
              <p className="text-[14px] text-success font-medium mb-1">5% commission</p>
              <p className="text-[14px] text-slate-mid mb-6">For growing producers</p>

              <ul className="space-y-3 mb-8">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-foreground">
                    <Check size={16} className="text-amber shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="slate"
                className="w-full h-12 text-[15px]"
                onClick={() => navigate("/get-started")}
              >
                Start free, upgrade anytime
              </Button>
              <p className="text-[12px] text-slate-light text-center mt-3">
                Most producers upgrade within 2 months
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-[14px] text-slate-mid text-center mt-10 max-w-xl mx-auto">
            Both plans include: {sharedFeatures.join(", ")}.
          </p>
          <p className="text-[14px] text-slate-light text-center mt-3">
            No credit card required. No hidden fees. Cancel anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingSection;
