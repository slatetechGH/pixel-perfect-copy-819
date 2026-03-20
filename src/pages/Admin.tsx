import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Download, Users, Building2, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProducerRow {
  id: string;
  business_name: string | null;
  email: string;
  stripe_connect_status: string;
  commission_percentage: number;
}

const Admin = () => {
  const [producers, setProducers] = useState<ProducerRow[]>([]);
  const [totalSubs, setTotalSubs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [profilesRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("id, business_name, email, stripe_connect_status, commission_percentage"),
        supabase.from("subscribers").select("id, status"),
      ]);
      setProducers((profilesRes.data || []) as ProducerRow[]);
      setTotalSubs((subsRes.data || []).filter((s: any) => s.status === "active").length);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activeProducers = producers.filter(p => p.stripe_connect_status === "active").length;
  // Mock commission data — in production this would come from transactions table
  const totalPlatformRevenue = producers.length * 151.50; // placeholder

  const exportCSV = () => {
    const headers = ["Business Name", "Email", "Stripe Status", "Commission %"];
    const rows = producers.map(p => [
      p.business_name || "—",
      p.email,
      p.stripe_connect_status,
      String(p.commission_percentage),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "producers-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Admin"
      subtitle="Platform overview"
      actions={
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1.5" />Export CSV
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <MetricCard title="Platform Revenue" value={`£${totalPlatformRevenue.toFixed(0)}`} change="+0%" trend="up" />
        <MetricCard title="Active Producers" value={String(activeProducers)} change="+0%" trend="up" delay={80} />
        <MetricCard title="Total Producers" value={String(producers.length)} change="+0%" trend="up" delay={160} />
        <MetricCard title="Total Subscribers" value={String(totalSubs)} change="+0%" trend="up" delay={240} />
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Producers</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
            </div>
          ) : producers.length === 0 ? (
            <p className="text-[14px] text-muted-foreground py-8 text-center">No producers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Business</th>
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Email</th>
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Stripe Status</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {producers.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 text-[14px] font-medium text-foreground">{p.business_name || "—"}</td>
                      <td className="py-3 pr-4 text-[14px] text-muted-foreground">{p.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          p.stripe_connect_status === "active"
                            ? "bg-success/10 text-success"
                            : p.stripe_connect_status === "connecting"
                            ? "bg-amber/10 text-amber"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {p.stripe_connect_status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[14px] text-foreground">{p.commission_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Admin;
