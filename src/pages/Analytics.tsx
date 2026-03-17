import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const revenueTimeline = [
  { month: "Sep", mrr: 1200 },
  { month: "Oct", mrr: 1800 },
  { month: "Nov", mrr: 2400 },
  { month: "Dec", mrr: 3100 },
  { month: "Jan", mrr: 3600 },
  { month: "Feb", mrr: 4200 },
  { month: "Mar", mrr: 4850 },
];

const tierBreakdown = [
  { name: "Free", value: 64, color: "hsl(213, 27%, 62%)" },
  { name: "Standard", value: 89, color: "hsl(217, 33%, 17%)" },
  { name: "Premium", value: 34, color: "hsl(38, 92%, 50%)" },
];

const Analytics = () => (
  <DashboardLayout title="Analytics" subtitle="Performance insights">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
      <MetricCard title="MRR" value="£4,850" change="+15.5%" trend="up" />
      <MetricCard title="Lifetime Value" value="£186" change="+8.2%" trend="up" delay={80} />
      <MetricCard title="Drop Conversion" value="72%" change="+5.1%" trend="up" delay={160} />
      <MetricCard title="Content Engagement" value="3.2k" change="+22%" trend="up" delay={240} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2 border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">MRR Growth</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTimeline}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" tickFormatter={(v) => `£${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }}
                itemStyle={{ color: "white" }}
                labelStyle={{ color: "hsl(213, 27%, 70%)" }}
                formatter={(v: number) => [`£${v}`, "MRR"]}
              />
              <Area type="monotone" dataKey="mrr" stroke="hsl(217, 33%, 17%)" strokeWidth={2} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Tier Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={tierBreakdown} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {tierBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Tooltip
                contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }}
                itemStyle={{ color: "white" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Analytics;
