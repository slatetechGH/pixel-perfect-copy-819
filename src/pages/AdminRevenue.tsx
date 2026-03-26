import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Loader2, PoundSterling } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProducerRevenue {
  id: string;
  business_name: string;
  mrr: number;
  commission: number;
  tier: string;
  commission_percentage: number;
}

const AdminRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [totalMRR, setTotalMRR] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [platformSubRevenue, setPlatformSubRevenue] = useState(0);
  const [standardCount, setStandardCount] = useState(0);
  const [producerBreakdown, setProducerBreakdown] = useState<ProducerRevenue[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [subsRes, rolesRes, profilesRes] = await Promise.all([
        supabase.from("subscriptions").select("producer_id, amount_paid, status").eq("status", "active"),
        supabase.from("user_roles").select("user_id").eq("role", "producer"),
        supabase.from("profiles").select("id, business_name, commission_percentage, subscription_tier"),
      ]);

      const subs = subsRes.data || [];
      const profiles = profilesRes.data || [];
      const producerIds = (rolesRes.data || []).map((r: any) => r.user_id);

      // Count standard tier producers
      const stdProducers = profiles.filter((p: any) => p.subscription_tier === "standard");
      setStandardCount(stdProducers.length);
      setPlatformSubRevenue(stdProducers.length * 39);

      // Group revenue by producer
      const revenueMap: Record<string, number> = {};
      subs.forEach((s: any) => {
        revenueMap[s.producer_id] = (revenueMap[s.producer_id] || 0) + (s.amount_paid || 0);
      });

      const breakdown: ProducerRevenue[] = producerIds.map(pid => {
        const profile = profiles.find((p: any) => p.id === pid);
        const mrr = (revenueMap[pid] || 0) / 100;
        const commPct = profile?.commission_percentage || 8;
        return {
          id: pid,
          business_name: profile?.business_name || "Not set up",
          mrr,
          commission: mrr * (commPct / 100),
          tier: profile?.subscription_tier || "free",
          commission_percentage: commPct,
        };
      }).filter(p => p.mrr > 0).sort((a, b) => b.mrr - a.mrr);

      const mrr = Object.values(revenueMap).reduce((s, v) => s + v, 0) / 100;
      const totalComm = breakdown.reduce((s, p) => s + p.commission, 0);
      setTotalMRR(mrr);
      setTotalCommission(totalComm);
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

  const totalSlateIncome = totalCommission + platformSubRevenue;

  return (
    <DashboardLayout title="Revenue & Commission" subtitle="Platform-wide financial overview">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-7">
        <MetricCard title="Platform MRR" value={`£${totalMRR.toFixed(0)}`} change="+0%" trend="up" />
        <MetricCard title="Commission Revenue" value={`£${totalCommission.toFixed(2)}`} change="+0%" trend="up" delay={80} />
        <MetricCard title="Subscription Revenue" value={`£${platformSubRevenue}/mo`} change={`${standardCount} Standard`} trend="up" delay={160} />
        <MetricCard title="Total Slate Income" value={`£${totalSlateIncome.toFixed(2)}/mo`} change="+0%" trend="up" delay={240} />
      </div>

      {totalMRR === 0 && platformSubRevenue === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="py-16 text-center">
            <PoundSterling className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-[16px] font-medium text-muted-foreground mb-2">No revenue yet</p>
            <p className="text-[14px] text-muted-foreground">Revenue will appear here once producers have paying subscribers or upgrade to Standard</p>
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
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Tier</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3 pr-4">MRR</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3 pr-4">Rate</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {producerBreakdown.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 text-[14px] font-medium text-foreground">{p.business_name}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${p.tier === "standard" ? "bg-amber/10 text-amber" : "bg-secondary text-muted-foreground"}`}>
                          {p.tier === "standard" ? "Standard" : "Free"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-[14px] text-foreground">£{p.mrr.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-right text-[14px] text-muted-foreground">{p.commission_percentage}%</td>
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
