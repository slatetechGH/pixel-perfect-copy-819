import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { useDashboard } from "@/contexts/DashboardContext";
import { useProducerLabels } from "@/hooks/useProducerLabels";
import { LabelWithTooltip } from "@/components/LabelWithTooltip";
import { CommissionCard } from "@/components/commission/CommissionCard";
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

function computeBreakdown(grossRevenue: number) {
  const stripeFees = grossRevenue * 0.022 + 0.30;
  const slateCommission = grossRevenue * 0.08;
  const netRevenue = grossRevenue - stripeFees - slateCommission;
  return { grossRevenue, stripeFees, slateCommission, netRevenue };
}

const EmptyChartMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[260px] text-muted-foreground text-[14px]">
    {message}
  </div>
);

const Analytics = () => {
  const { revenueDataSets, kpiData, subscriberGrowthData, tierBreakdown } = useDashboard();
  const { getLabel } = useProducerLabels();
  const [range, setRange] = useState("6m");
  const data = revenueDataSets[range] || revenueDataSets["all"] || [];

  const mrrNum = parseFloat(kpiData.mrr.replace(/[^0-9.]/g, '')) || 0;
  const breakdown = computeBreakdown(mrrNum);

  const hasRevenueData = data.length > 0 && data.some(d => d.revenue > 0);
  const hasSubscriberGrowth = subscriberGrowthData.length > 0 && subscriberGrowthData.some(d => d.new > 0 || d.churned > 0);
  const hasTierData = tierBreakdown.length > 0 && tierBreakdown.some(t => t.value > 0);

  return (
    <DashboardLayout title="Analytics" subtitle="Performance insights">
      {/* Date range */}
      <div className="flex gap-2 mb-5 flex-wrap overflow-x-auto">
        {ranges.map(r => (
          <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[44px] ${range === r.key ? "bg-foreground text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <MetricCard title="MRR" value={kpiData.mrr} change={kpiData.mrrChange} trend="up" />
        <MetricCard title="Lifetime Value" value={kpiData.ltv} change={kpiData.ltvChange} trend="up" delay={80} />
        <MetricCard title="Drop Conversion" value={kpiData.dropConversion} change={kpiData.dropConversionChange} trend="up" delay={160} />
        <MetricCard title="Content Engagement" value={kpiData.contentEngagement} change={kpiData.contentEngagementChange} trend="up" delay={240} />
      </div>

      {/* Revenue Breakdown Table */}
      <Card className="border-0 shadow-card mb-7">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">
            <LabelWithTooltip term="Revenue Breakdown (Current Month)" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">
                <LabelWithTooltip term="Gross Revenue" />
              </p>
              <p className="text-[20px] font-bold text-foreground">£{breakdown.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">Stripe Fees</p>
              <p className="text-[20px] font-bold text-muted-foreground">−£{breakdown.stripeFees.toFixed(2)}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">Slate Commission (8%)</p>
              <p className="text-[20px] font-bold text-muted-foreground">−£{breakdown.slateCommission.toFixed(2)}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">
                <LabelWithTooltip term="Net Revenue" />
              </p>
              <p className="text-[20px] font-bold text-foreground">£{breakdown.netRevenue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2 border-0 shadow-card">
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">
              <LabelWithTooltip term="Revenue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height={200}>
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
                  <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} formatter={(v: number) => [`£${v}`, getLabel("Revenue")]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(217, 33%, 17%)" strokeWidth={2} fill="url(#mrrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="Revenue data will appear here once you have active subscribers" />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">Tier Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            {hasTierData ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={tierBreakdown} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {tierBreakdown.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="Tier data will appear here once you have subscribers" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission Card */}
      <div className="mb-7">
        <CommissionCard mrr={mrrNum} />
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">
            <LabelWithTooltip term="Subscriber Growth" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          {hasSubscriberGrowth ? (
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
          ) : (
            <EmptyChartMessage message="Subscriber growth data will appear here as your audience grows" />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
