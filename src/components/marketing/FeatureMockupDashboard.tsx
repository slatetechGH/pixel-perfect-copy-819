import { TrendingUp } from "lucide-react";

const FeatureMockupDashboard = () => (
  <div className="w-full px-2 py-1 space-y-3">
    {/* KPI boxes */}
    <div className="flex gap-2.5">
      <div className="flex-1 bg-secondary rounded-lg p-3">
        <p className="text-[16px] font-bold text-foreground">£4,850</p>
        <p className="text-[9px] text-muted-foreground/60 mt-0.5">Monthly Income</p>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} className="text-success" />
          <span className="text-[9px] font-medium" style={{ color: "#10B981" }}>+15.5%</span>
        </div>
      </div>
      <div className="flex-1 bg-secondary rounded-lg p-3">
        <p className="text-[16px] font-bold text-foreground">187</p>
        <p className="text-[9px] text-muted-foreground/60 mt-0.5">Customers</p>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} className="text-success" />
          <span className="text-[9px] font-medium" style={{ color: "#10B981" }}>+12.3%</span>
        </div>
      </div>
    </div>

    {/* Area chart */}
    <div className="w-full relative" style={{ height: 72 }}>
      <svg width="100%" height="100%" viewBox="0 0 300 72" preserveAspectRatio="none" className="absolute inset-0">
        {/* Grid lines */}
        {[14, 28, 43, 57].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#94A3B8" strokeOpacity="0.15" strokeDasharray="4 3" strokeWidth="0.5" />
        ))}
        {/* Area fill */}
        <path
          d="M0,62 C30,58 60,50 90,42 C120,34 150,38 180,28 C210,18 240,14 270,10 C285,8 300,6 300,6 L300,72 L0,72 Z"
          fill="#1E293B"
          fillOpacity="0.05"
        />
        {/* Line */}
        <path
          d="M0,62 C30,58 60,50 90,42 C120,34 150,38 180,28 C210,18 240,14 270,10 C285,8 300,6 300,6"
          stroke="#1E293B"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>

    {/* Activity feed */}
    <div className="space-y-2">
      {[
        { name: "Sarah Mitchell", tier: "Premium plan", time: "2 min ago", color: "#10B981" },
        { name: "James Chen", tier: "Standard plan", time: "15 min ago", color: "#F59E0B" },
      ].map((row) => (
        <div key={row.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
          <span className="text-[10px] font-medium text-muted-foreground">{row.name}</span>
          <span className="text-[9px] text-muted-foreground/50">{row.tier}</span>
          <span className="text-[9px] text-muted-foreground/50 ml-auto">{row.time}</span>
        </div>
      ))}
    </div>
  </div>
);

export default FeatureMockupDashboard;
