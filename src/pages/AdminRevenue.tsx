import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Loader2, PoundSterling, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ProducerRevenue {
  id: string;
  business_name: string;
  mrr: number;
  commission: number;
}

const AdminRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [totalMRR, setTotalMRR] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [producerBreakdown, setProducerBreakdown] = useState<ProducerRevenue[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [subsRes, rolesRes, profilesRes] = await Promise.all([
        supabase.from("subscriptions").select("producer_id, amount_paid, status").eq("status", "active"),
        supabase.from("user_roles").select("user_id").eq("role", "producer"),
        supabase.from("profiles").select("id, business_name"),
      ]);

      const subs = subsRes.data || [];
      const profiles = profilesRes.data || [];
      const producerIds = (rolesRes.data || []).map((r: any) => r.user_id);

      // Group revenue by producer
      const revenueMap: Record<string, number> = {};
      subs.forEach((s: any) => {
        revenueMap[s.producer_id] = (revenueMap[s.producer_id] || 0) + (s.amount_paid || 0);
      });

      const breakdown: ProducerRevenue[] = producerIds.map(pid => {
        const profile = profiles.find((p: any) => p.id === pid);
        const mrr = (revenueMap[pid] || 0) / 100;
        return {
          id: pid,
          business_name: profile?.business_name || "Not set up",
          mrr,
          commission: mrr * 0.08,
        };
      }).filter(p => p.mrr > 0).sort((a, b) => b.mrr - a.mrr);

      const mrr = Object.values(revenueMap).reduce((s, v) => s + v, 0) / 100;
      setTotalMRR(mrr);
      setTotalCommission(mrr * 0.08);
      setProducerBreakdown(breakdown);
      setLoading(false);
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Revenue & Commission" subtitle="Platform-wide financial overview">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Revenue & Commission" subtitle="Platform-wide financial overview">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        <MetricCard title="Platform MRR" value={`£${totalMRR.toFixed(0)}`} change="+0%" trend="up" />
        <MetricCard title="Slate Commission (8%)" value={`£${totalCommission.toFixed(2)}`} change="+0%" trend="up" delay={80} />
        <MetricCard title="Active Producers w/ Revenue" value={String(producerBreakdown.length)} change="+0%" trend="up" delay={160} />
      </div>

      {totalMRR === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="py-16 text-center">
            <PoundSterling className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-[16px] font-medium text-muted-foreground mb-2">No revenue yet</p>
            <p className="text-[14px] text-muted-foreground">Revenue will appear here once producers have paying subscribers</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">Revenue by Producer</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Producer</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3 pr-4">MRR</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {producerBreakdown.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 text-[14px] font-medium text-foreground">{p.business_name}</td>
                      <td className="py-3 pr-4 text-right text-[14px] text-foreground">£{p.mrr.toFixed(2)}</td>
                      <td className="py-3 text-right text-[14px] text-success font-medium">£{p.commission.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AdminRevenue;
