import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, FileText, TrendingUp } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const subscriberData = [
  { month: "Sep", new: 12, churned: 3 },
  { month: "Oct", new: 18, churned: 4 },
  { month: "Nov", new: 22, churned: 5 },
  { month: "Dec", new: 28, churned: 6 },
  { month: "Jan", new: 35, churned: 7 },
  { month: "Feb", new: 30, churned: 5 },
  { month: "Mar", new: 38, churned: 6 },
];

const revenueData = [
  { month: "Sep", revenue: 800 },
  { month: "Oct", revenue: 1200 },
  { month: "Nov", revenue: 1800 },
  { month: "Dec", revenue: 2400 },
  { month: "Jan", revenue: 3100 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 4850 },
];

const DashboardHome = () => {
  const { subscribers, drops, content, conversations } = useDashboard();
  const navigate = useNavigate();

  const recentActivity = [
    { id: 1, type: "subscribe", name: "Sarah Mitchell", detail: "Chef's Catch Club", time: "2 min ago", link: "/dashboard/subscribers" },
    { id: 2, type: "drop", name: "Weekend Smokehouse Selection", detail: "18/25 sold", time: "15 min ago", link: "/dashboard/drops" },
    { id: 3, type: "subscribe", name: "James Chen", detail: "The Standard Catch", time: "1 hr ago", link: "/dashboard/subscribers" },
    { id: 4, type: "cancel", name: "Emma Davies", detail: "The Standard Catch", time: "3 hr ago", link: "/dashboard/subscribers" },
    { id: 5, type: "subscribe", name: "Oliver Thompson", detail: "Chef's Catch Club", time: "5 hr ago", link: "/dashboard/subscribers" },
    { id: 6, type: "recipe", name: "Pan-Seared Sea Bass", detail: "142 views", time: "6 hr ago", link: "/dashboard/content" },
  ];

  const activityDotColor: Record<string, string> = {
    subscribe: "bg-amber",
    drop: "bg-amber",
    cancel: "bg-destructive/80",
    recipe: "bg-success",
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="The Harbour Fish Co. — Overview"
      actions={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="text-[14px] font-medium" onClick={() => navigate("/dashboard/drops")}>
            <Zap className="h-4 w-4 mr-1.5" />New Drop
          </Button>
          <Button size="sm" className="text-[14px] font-medium bg-foreground hover:bg-foreground/90 text-white" onClick={() => navigate("/dashboard/content")}>
            <FileText className="h-4 w-4 mr-1.5" />Post Recipe
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Monthly Recurring Revenue" value="£4,850" change="+15.5%" trend="up" delay={0} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/subscribers")}>
          <MetricCard title="Total Subscribers" value={String(subscribers.length)} change="+12.3%" trend="up" delay={80} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Churn Rate" value="3.2%" change="-0.8%" trend="up" delay={160} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard/analytics")}>
          <MetricCard title="Avg. Revenue Per User" value="£25.90" change="+2.1%" trend="up" delay={240} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(217, 33%, 17%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <YAxis tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" tickFormatter={(v) => `£${v}`} />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} formatter={(value: number) => [`£${value}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(217, 33%, 17%)" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 27%, 62%)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <YAxis tick={{ fontSize: 11, fontWeight: 400 }} stroke="hsl(213, 27%, 62%)" />
                <Tooltip contentStyle={{ background: "hsl(217, 33%, 17%)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white" }} itemStyle={{ color: "white" }} labelStyle={{ color: "hsl(213, 27%, 70%)" }} />
                <Bar dataKey="new" fill="hsl(217, 33%, 17%)" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="New" />
                <Bar dataKey="churned" fill="hsl(38, 92%, 50%)" fillOpacity={0.5} radius={[4, 4, 0, 0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="opacity-0 animate-fade-in border-0 shadow-card" style={{ animationDelay: "450ms" }}>
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="space-y-0">
            {recentActivity.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.link)}
                className="w-full flex items-center justify-between py-4 hover:bg-background/60 -mx-3 px-3 rounded-md transition-colors duration-150 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${activityDotColor[item.type] || "bg-muted-foreground"}`} />
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
