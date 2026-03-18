import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "0",
    desc: "Perfect for getting started",
    features: ["Up to 50 subscribers", "1 subscription tier", "Basic analytics", "Email support", "Slate-branded page"],
    popular: false,
  },
  {
    name: "Growth",
    price: "29",
    desc: "For producers ready to scale",
    features: ["Unlimited subscribers", "Unlimited tiers", "Product drops", "Full analytics", "Custom branding", "Priority support"],
    popular: true,
  },
  {
    name: "Pro",
    price: "79",
    desc: "For established businesses",
    features: ["Everything in Growth", "API access", "Dedicated account manager", "Advanced messaging", "Multi-location support", "Custom integrations"],
    popular: false,
  },
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
          <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-16 text-center">
            Simple pricing. No surprises.
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.1}>
              <div
                className={cn(
                  "bg-white rounded-2xl p-8 shadow-card relative h-full flex flex-col",
                  plan.popular && "border-t-2 border-t-amber"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-white text-[11px] font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[20px] font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-[14px] text-slate-mid mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-[40px] font-bold text-foreground">£{plan.price}</span>
                  <span className="text-[16px] text-slate-light">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px] text-slate-mid">
                      <Check size={16} className="text-amber mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "slate" : "slate-outline"}
                  className="w-full"
                  onClick={() => navigate("/get-started")}
                >
                  Get started
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.4}>
          <p className="text-[14px] text-slate-light text-center mt-10">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingSection;
