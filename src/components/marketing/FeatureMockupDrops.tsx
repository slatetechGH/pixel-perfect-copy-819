import { Package } from "lucide-react";

const countdown = [
  { value: "02", label: "days" },
  { value: "14", label: "hrs" },
  { value: "32", label: "min" },
  { value: "08", label: "sec" },
];

const FeatureMockupDrops = () => (
  <div className="w-full px-2 py-1">
    {/* Product image placeholder */}
    <div className="w-full rounded-t-lg bg-secondary flex items-center justify-center" style={{ height: "38%" , minHeight: 80 }}>
      <Package size={24} className="text-muted-foreground/40" strokeWidth={1.5} />
    </div>

    <div className="pt-3 space-y-3">
      {/* Name & price */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-foreground leading-tight">Weekend Smokehouse Selection</p>
        <p className="text-[16px] font-bold text-foreground shrink-0">£28.00</p>
      </div>

      {/* Countdown */}
      <div className="flex gap-1.5">
        {countdown.map((c) => (
          <div key={c.label} className="flex-1 bg-secondary rounded text-center py-1.5">
            <p className="text-[11px] font-medium text-foreground">{c.value}</p>
            <p className="text-[8px] text-muted-foreground/60">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
          <div className="h-full bg-foreground rounded-sm" style={{ width: "72%" }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-muted-foreground/60">18 of 25 claimed</span>
          <span
            className="text-[9px] font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: "hsl(38 92% 50% / 0.1)", color: "#F59E0B" }}
          >
            Limited
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default FeatureMockupDrops;
