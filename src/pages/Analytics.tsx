import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { useDashboard } from "@/contexts/DashboardContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";

const ranges = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "3m", label: "Last 3 months" },
  { key: "6m", label: "Last 6 months" },
  { key: "12m", label: "Last 12 months" },
  { key: "all", label: "All time" },
];

const Analytics = () => {
  const { revenueDataSets, kpiData, subscriberGrowthData, tierBreakdown } = useDashboard();
  const [range, setRange] = useState("6m");
  const data = revenueDataSets[range] || revenueDataSets["all"];

  return (
    <DashboardLayout title="Analytics" subtitle="Performance insights">
      {/* Date range */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ranges.map(r => (
          <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${range === r.key ? "bg-foreground text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <MetricCard title="MRR" value={kpiData.mrr} change={kpiData.mrrChange} trend="up" />
        <MetricCard title="Lifetime Value" value="£186" change="+8.2%" trend="up" delay={80} />
        <MetricCard title="Drop Conversion" value="72%" change="+5.1%" trend="up" delay={160} />
        <MetricCard title="Content Engagement" value="3.2k" change="+22%" trend="up" delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2 border-0 shadow-card">
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" tickFormatter={(v) => `£${v}`} />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} formatter={(v: number) => [`£${v}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(217, 33%, 17%)" strokeWidth={2} fill="url(#mrrGrad)" />
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
                  {tierBreakdown.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Subscriber Growth</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subscriberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(213, 27%, 62%)" />
              <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} />
              <Bar dataKey="new" fill="hsl(217, 33%, 17%)" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="New" />
              <Bar dataKey="churned" fill="hsl(38, 92%, 50%)" fillOpacity={0.5} radius={[4, 4, 0, 0]} name="Churned" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
