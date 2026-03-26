import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, FileText, TrendingUp, Copy, ExternalLink, ClipboardCheck } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useProducerLabels } from "@/hooks/useProducerLabels";
import { LabelWithTooltip } from "@/components/LabelWithTooltip";
import { CommissionCard } from "@/components/commission/CommissionCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { useTierLimits } from "@/hooks/useTierLimits";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const DashboardHome = () => {
  const { subscribers, settings, kpiData, revenueChartData, subscriberGrowthData, activityFeed, plans } = useDashboard();
  const { demoActive, accentColor } = useApp();
  const { getLabel } = useProducerLabels();
  const { isNearSubscriberLimit, isAtSubscriberLimit, subscriberCount, maxSubscribers, isFree } = useTierLimits();
  const navigate = useNavigate();

  // Calculate remaining collections
  const planCollections: Record<string, number> = {};
  plans.forEach(p => { planCollections[p.name] = p.collectionsPerMonth; });
  const collectionsRemaining = subscribers
    .filter(s => s.status === "active" && (planCollections[s.plan] || 0) > 0)
    .reduce((sum, s) => sum + (planCollections[s.plan] || 0), 0);

  const storefrontSlug =
    settings.urlSlug ||
    settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const storefrontUrl = `slatetech.co.uk/store/${storefrontSlug}`;

  const copyStorefrontUrl = () => {
    navigator.clipboard.writeText(`https://${storefrontUrl}`);
    toast.success("Storefront URL copied!");
  };

  const activityDotColor: Record<string, string> = {
    subscribe: "bg-amber",
    drop: "bg-amber",
    cancel: "bg-destructive/80",
    recipe: "bg-success",
  };

  const chartStroke = demoActive ? accentColor : "hsl(217, 33%, 17%)";
  const chartFill = demoActive ? accentColor : "hsl(217, 33%, 17%)";
  const barSecondary = demoActive ? accentColor : "hsl(38, 92%, 50%)";

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`${settings.businessName} — Overview`}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="text-[14px] font-medium" onClick={() => navigate("/dashboard/drops")}>
            <Zap className="h-4 w-4 mr-1.5" />New Drop
          </Button>
          <Button size="sm" className="text-[14px] font-medium" onClick={() => navigate("/dashboard/content")}>
            <FileText className="h-4 w-4 mr-1.5" />Post Recipe
          </Button>
        </div>
      }
    >
      {/* Storefront URL banner */}
      {storefrontSlug && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-7 px-5 py-4 rounded-xl border border-border bg-card">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-muted-foreground">Share your storefront</p>
            <p className="text-[14px] font-medium text-foreground truncate">{storefrontUrl}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyStorefrontUrl}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/store/${storefrontSlug}`, "_blank")}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />View
            </Button>
          </div>
        </div>
      )}

      {/* Near subscriber limit banner */}
      {isFree && isNearSubscriberLimit && !isAtSubscriberLimit && (
        <UpgradeBanner message={`You're at ${subscriberCount} of ${maxSubscribers} subscribers. Upgrade to Standard before you hit the limit.`} />
      )}
      {isFree && isAtSubscriberLimit && (
        <UpgradeBanner message="You've reached 25 subscribers — upgrade to Standard for unlimited subscribers" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Monthly Recurring Revenue" value={kpiData.mrr} change={kpiData.mrrChange} trend="up" delay={0} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/subscribers")}>
          <MetricCard title="Total Subscribers" value={kpiData.totalSubs} change={kpiData.subsChange} trend="up" delay={80} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Churn Rate" value={kpiData.churn} change={kpiData.churnChange} trend="up" delay={160} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Avg. Revenue Per User" value={kpiData.arpu} change={kpiData.arpuChange} trend="up" delay={240} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <LabelWithTooltip term="Revenue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartFill} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={chartFill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <YAxis tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" tickFormatter={(v) => `£${v}`} />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} formatter={(value: number) => [`£${value}`, getLabel("Revenue")]} />
                <Area type="monotone" dataKey="revenue" stroke={chartStroke} strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">
              <LabelWithTooltip term="Subscriber Growth" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subscriberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <YAxis tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} />
                <Bar dataKey="new" fill="hsl(217, 33%, 17%)" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="New" />
                <Bar dataKey="churned" fill={barSecondary} fillOpacity={0.5} radius={[4, 4, 0, 0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Collections Today Card */}
      {plans.some(p => p.collectionsPerMonth > 0) && (
        <Card className="opacity-0 animate-fade-in border-0 shadow-card mb-7" style={{ animationDelay: "430ms" }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-5 w-5 text-amber" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">
                {collectionsRemaining > 0
                  ? `${collectionsRemaining} collections remaining this month`
                  : "No collections due"}
              </p>
              <button
                onClick={() => navigate("/dashboard/collections")}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                View collection sheet →
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Card */}
      <div className="mb-7">
        <CommissionCard mrr={parseFloat(kpiData.mrr.replace(/[^0-9.]/g, '')) || 0} />
      </div>

      <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "450ms" }}>
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="space-y-0">
            {activityFeed.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.link)}
                className="w-full flex items-center justify-between py-4 hover:bg-background/60 -mx-3 px-3 rounded-md transition-colors duration-150 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${!demoActive ? (activityDotColor[item.type] || "bg-muted-foreground") : ""}`}
                    style={demoActive ? { backgroundColor: item.type === "cancel" ? undefined : accentColor } : undefined}
                  />
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{item.name}</p>
                    <p className="text-[13px] text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
                <span className="text-[12px] text-muted-foreground font-light">{item.time}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DashboardHome;
