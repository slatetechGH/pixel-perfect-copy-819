import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "£0",
    features: ["Email newsletter", "Basic profile"],
    highlight: false,
  },
  {
    name: "Standard",
    price: "£15",
    features: ["Monthly fish box", "10% discount", "Email newsletter"],
    highlight: true,
  },
  {
    name: "Premium",
    price: "£35",
    features: ["Weekly fish box", "20% discount", "Priority access"],
    highlight: false,
  },
];

const FeatureMockupSubscriptions = () => (
  <div className="flex gap-2.5 w-full px-2 py-1">
    {plans.map((plan) => (
      <div
        key={plan.name}
        className={`flex-1 rounded-lg p-3 ${
          plan.highlight
            ? "bg-secondary border-[1.5px] border-foreground shadow-sm"
            : "bg-secondary"
        }`}
      >
        <p className="text-[11px] font-medium text-muted-foreground">{plan.name}</p>
        <p className="text-[16px] font-bold text-foreground mt-0.5">{plan.price}</p>
        <div className="mt-2 space-y-1.5">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <Check size={10} className="text-muted-foreground/60 shrink-0" strokeWidth={2} />
              <span className="text-[9px] text-muted-foreground/70">{f}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default FeatureMockupSubscriptions;
