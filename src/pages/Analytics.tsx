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
  { name: "Free", value: 64, color: "hsl(40, 20%, 75%)" },
  { name: "Standard", value: 89, color: "hsl(152, 45%, 45%)" },
  { name: "Premium", value: 34, color: "hsl(30, 60%, 52%)" },
];

const Analytics = () => (
  <DashboardLayout title="Analytics" subtitle="Performance insights">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard title="MRR" value="£4,850" change="+15.5%" trend="up" />
      <MetricCard title="Lifetime Value" value="£186" change="+8.2%" trend="up" delay={80} />
      <MetricCard title="Drop Conversion" value="72%" change="+5.1%" trend="up" delay={160} />
      <MetricCard title="Content Engagement" value="3.2k" change="+22%" trend="up" delay={240} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">MRR Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTimeline}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 5%, 45%)" tickFormatter={(v) => `£${v}`} />
              <Tooltip formatter={(v: number) => [`£${v}`, "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke="hsl(152, 45%, 28%)" strokeWidth={2} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tier Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={tierBreakdown} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {tierBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Analytics;
