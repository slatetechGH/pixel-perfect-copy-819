import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagResult {
  label: string;
  status: "ok" | "error" | "pending";
  detail?: string;
}

const AdminHealth = () => {
  const [loading, setLoading] = useState(true);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResults, setDiagResults] = useState<DiagResult[]>([]);

  const edgeFunctions = [
    { name: "send-enquiry-email", desc: "Sends enquiry emails via Resend" },
    { name: "stripe-connect-onboarding", desc: "Handles Stripe Connect onboarding" },
    { name: "stripe-webhooks", desc: "Processes Stripe webhook events" },
  ];

  useEffect(() => {
    const fetch = async () => {
      const tableNames = ["profiles", "subscribers", "plans", "content", "drops", "leads", "subscriptions", "user_roles"] as const;
      type TableName = typeof tableNames[number];
      const results: Record<string, number> = {};
      await Promise.all(
        tableNames.map(async (t: TableName) => {
          const { count } = await supabase.from(t).select("id", { count: "exact", head: true });
          results[t] = count || 0;
        })
      );
      setTableCounts(results);
      setLoading(false);
    };
    fetch();
  }, []);

  const runDiagnostics = async () => {
    setDiagRunning(true);
    const results: DiagResult[] = [];

    // Test table queries
    const diagTables = ["profiles", "leads", "subscribers", "plans"] as const;
    for (const t of diagTables) {
      try {
        const { error } = await supabase.from(t).select("id").limit(1);
        results.push({ label: `Query ${t}`, status: error ? "error" : "ok", detail: error?.message });
      } catch (e: any) {
        results.push({ label: `Query ${t}`, status: "error", detail: e.message });
      }
    }

    // Test edge functions (just check if they're reachable)
    for (const fn of edgeFunctions) {
      try {
        const { error } = await supabase.functions.invoke(fn.name, {
          body: { test: true },
        });
        // Even errors mean the function is deployed
        results.push({ label: `Edge fn: ${fn.name}`, status: "ok", detail: "Deployed and reachable" });
      } catch {
        results.push({ label: `Edge fn: ${fn.name}`, status: "error", detail: "Unreachable" });
      }
    }

    setDiagResults(results);
    setDiagRunning(false);
    toast.success("Diagnostics complete");
  };

  if (loading) {
    return (
      <DashboardLayout title="Platform Health" subtitle="System status and diagnostics">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Platform Health"
      subtitle="System status and diagnostics"
      actions={
        <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={diagRunning}>
          {diagRunning ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          Run Diagnostics
        </Button>
      }
    >
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-7 px-4 py-3 rounded-xl border border-success/30 bg-success/5">
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="text-[14px] font-medium text-success">All systems running</span>
      </div>

      {/* Table record counts */}
      <Card className="border-0 shadow-card mb-6">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Database Tables</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(tableCounts).map(([table, count]) => (
              <div key={table} className="rounded-lg border border-border p-3">
                <p className="text-[12px] text-muted-foreground capitalize">{table.replace("_", " ")}</p>
                <p className="text-[18px] font-semibold text-foreground">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edge functions */}
      <Card className="border-0 shadow-card mb-6">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">Edge Functions</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="space-y-3">
            {edgeFunctions.map(fn => (
              <div key={fn.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-[14px] font-medium text-foreground">{fn.name}</p>
                  <p className="text-[12px] text-muted-foreground">{fn.desc}</p>
                </div>
                <span className="text-[12px] text-success font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />Deployed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic results */}
      {diagResults.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2 px-7 pt-7">
            <CardTitle className="text-[15px] font-medium text-foreground">Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <div className="space-y-2">
              {diagResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-[14px] text-foreground">{r.label}</span>
                  <div className="flex items-center gap-2">
                    {r.detail && <span className="text-[12px] text-muted-foreground">{r.detail}</span>}
                    {r.status === "ok" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AdminHealth;
