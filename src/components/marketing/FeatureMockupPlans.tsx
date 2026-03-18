import { Check } from "lucide-react";

const plans = [
  { name: "Free", price: "£0", features: ["Newsletter", "Basic profile"] },
  { name: "Standard", price: "£15/mo", features: ["Fish box", "10% discount", "Newsletter"], highlight: true },
  { name: "Premium", price: "£35/mo", features: ["Weekly box", "20% discount", "Priority access"] },
];

const FeatureMockupPlans = () => (
  <div className="flex gap-2 w-full px-2 py-1">
    {plans.map((plan) => (
      <div
        key={plan.name}
        className={`flex-1 rounded-lg p-2.5 bg-secondary ${
          plan.highlight ? "border-[1.5px] border-foreground" : ""
        }`}
      >
        <p className="text-[10px] font-medium text-muted-foreground">{plan.name}</p>
        <p className="text-[15px] font-bold text-foreground mt-0.5">{plan.price}</p>
        <div className="mt-2 space-y-1.5">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-1">
              <Check size={8} className="text-muted-foreground/60 shrink-0" strokeWidth={2.5} />
              <span className="text-[8px] text-muted-foreground/70">{f}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default FeatureMockupPlans;
