import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, FileText, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { month: "Sep", revenue: 1200 },
  { month: "Oct", revenue: 1800 },
  { month: "Nov", revenue: 2400 },
  { month: "Dec", revenue: 3100 },
  { month: "Jan", revenue: 3600 },
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 4850 },
];

const subscriberData = [
  { month: "Sep", new: 12, churned: 3 },
  { month: "Oct", new: 18, churned: 4 },
  { month: "Nov", new: 22, churned: 5 },
  { month: "Dec", new: 28, churned: 6 },
  { month: "Jan", new: 35, churned: 7 },
  { month: "Feb", new: 30, churned: 5 },
  { month: "Mar", new: 38, churned: 6 },
];

const recentActivity = [
  { id: 1, type: "subscribe", name: "Sarah Mitchell", tier: "Premium", time: "2 min ago" },
  { id: 2, type: "drop", name: "Wild Turbot Drop", detail: "12/30 sold", time: "15 min ago" },
  { id: 3, type: "subscribe", name: "James Chen", tier: "Standard", time: "1 hr ago" },
  { id: 4, type: "cancel", name: "Emma Davies", tier: "Standard", time: "3 hr ago" },
  { id: 5, type: "subscribe", name: "Oliver Thompson", tier: "Premium", time: "5 hr ago" },
  { id: 6, type: "recipe", name: "Pan-Seared Sea Bass", detail: "142 views", time: "6 hr ago" },
];

const DashboardHome = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="The Harbour Fish Co. — Overview"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-1" />
            New Drop
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Post Recipe
          </Button>
        </div>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Monthly Recurring Revenue" value="£4,850" change="+15.5%" trend="up" delay={0} />
        <MetricCard title="Total Subscribers" value="187" change="+12.3%" trend="up" delay={80} />
        <MetricCard title="Churn Rate" value="3.2%" change="-0.8%" trend="up" delay={160} />
        <MetricCard title="Avg. Revenue Per User" value="£25.90" change="+2.1%" trend="up" delay={240} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" tickFormatter={(v) => `£${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(40, 30%, 99%)",
                    border: "1px solid hsl(40, 18%, 88%)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`£${value}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(152, 45%, 28%)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(40, 30%, 99%)",
                    border: "1px solid hsl(40, 18%, 88%)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="new" fill="hsl(152, 45%, 28%)" radius={[4, 4, 0, 0]} name="New" />
                <Bar dataKey="churned" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      item.type === "cancel" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.type === "subscribe"
                      ? "New"
                      : item.type === "cancel"
                      ? "Cancel"
                      : item.type === "drop"
                      ? "Drop"
                      : "Content"}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.tier && `${item.tier} tier`}
                      {item.detail && item.detail}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DashboardHome;
