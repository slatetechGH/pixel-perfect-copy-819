import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const included = [
  "Unlimited subscribers",
  "Unlimited subscription tiers",
  "Product drops & limited editions",
  "Recipe & content sharing",
  "Built-in messaging",
  "Full analytics dashboard",
  "Custom branded storefront",
  "Stripe payments built-in",
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
          <h2 className="text-[36px] md:text-[48px] font-bold text-foreground leading-tight tracking-[-0.02em] mb-4 text-center">
            Completely free to use.
          </h2>
          <p className="text-[18px] md:text-[20px] text-slate-mid text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            Pay nothing upfront. We only make money when you do.{" "}
            <span className="text-foreground font-semibold">6% commission</span> on your subscriber revenue.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-card p-10">
            <div className="text-center mb-8">
              <span className="text-[56px] font-bold text-foreground leading-none">£0</span>
              <span className="text-[18px] text-slate-mid ml-2">/month</span>
              <p className="text-[15px] text-slate-mid mt-3">
                + 6% on subscriber payments
              </p>
            </div>

            <div className="bg-secondary rounded-xl p-5 mb-8">
              <p className="text-[13px] font-medium text-muted-foreground mb-1">Example</p>
              <p className="text-[15px] text-foreground leading-relaxed">
                Customer pays <span className="font-semibold">£60/mo</span> →
                Stripe takes <span className="font-semibold">~£1.62</span> →
                Slate takes <span className="font-semibold">£3.60</span> →
                You receive <span className="font-bold text-foreground">£54.78</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {included.map((f) => (
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
              Get started — it's free
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-[14px] text-slate-light text-center mt-10">
            No credit card required. No hidden fees. Cancel anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingSection;
