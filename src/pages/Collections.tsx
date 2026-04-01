import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, Printer, Send, ClipboardCheck, Undo2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface CollectionCount {
  subscriberId: string;
  count: number;
}

const Collections = () => {
  const { subscribers, plans, settings } = useDashboard();
  const { session, demoActive } = useApp();
  const producerId = session.supabaseUser?.id;

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [collections, setCollections] = useState<CollectionCount[]>([]);
  const [recentUndo, setRecentUndo] = useState<{ subscriberId: string; collectionId: string; timeout: ReturnType<typeof setTimeout> } | null>(null);
  const [sendConfirm, setSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const currentMonthYear = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  // Build a map of plan name → collectionsPerMonth
  const planCollections: Record<string, number> = {};
  plans.forEach(p => { planCollections[p.name] = p.collectionsPerMonth; });

  // Active subscribers with collection-based plans
  const activeWithCollections = subscribers
    .filter(s => s.status === "active" && (planCollections[s.plan] || 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Fetch collection counts for current month
  const fetchCollections = useCallback(async (my: string) => {
    if (demoActive) {
      // In demo mode, use mock data
      setCollections([]);
      return;
    }
    if (!producerId) return;
    const { data } = await supabase
      .from("collections")
      .select("subscriber_id")
      .eq("producer_id", producerId)
      .eq("month_year", my);

    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => {
      counts[r.subscriber_id] = (counts[r.subscriber_id] || 0) + 1;
    });
    setCollections(Object.entries(counts).map(([subscriberId, count]) => ({ subscriberId, count })));
  }, [producerId, demoActive]);

  useEffect(() => {
    fetchCollections(monthFilter);
  }, [monthFilter, fetchCollections]);

  const getCollectionCount = (subId: string) =>
    collections.find(c => c.subscriberId === subId)?.count || 0;

  const markCollected = async (sub: typeof subscribers[0]) => {
    const plan = plans.find(p => p.name === sub.plan);
    if (!plan) return;
    const currentCount = getCollectionCount(sub.id);
    if (currentCount >= plan.collectionsPerMonth) return;

    const newCount = currentCount + 1;

    // Optimistically update
    setCollections(prev => {
      const existing = prev.find(c => c.subscriberId === sub.id);
      if (existing) return prev.map(c => c.subscriberId === sub.id ? { ...c, count: newCount } : c);
      return [...prev, { subscriberId: sub.id, count: 1 }];
    });

    if (!demoActive && producerId) {
      const { data, error } = await supabase.from("collections").insert({
        producer_id: producerId,
        subscriber_id: sub.id,
        plan_id: plan.id,
        month_year: currentMonthYear,
        marked_by: "digital",
      } as any).select("id").single();

      if (error) {
        toast.error("Failed to record collection");
        setCollections(prev => prev.map(c => c.subscriberId === sub.id ? { ...c, count: currentCount } : c));
        return;
      }

      // Set up undo
      if (recentUndo) clearTimeout(recentUndo.timeout);
      const timeout = setTimeout(() => setRecentUndo(null), 5000);
      setRecentUndo({ subscriberId: sub.id, collectionId: data.id, timeout });
    }

    toast.success(`${sub.name} — ${newCount} of ${plan.collectionsPerMonth} collected`);
  };

  const undoCollection = async () => {
    if (!recentUndo) return;
    const { subscriberId, collectionId, timeout } = recentUndo;
    clearTimeout(timeout);

    setCollections(prev => prev.map(c =>
      c.subscriberId === subscriberId ? { ...c, count: Math.max(0, c.count - 1) } : c
    ));

    if (!demoActive) {
      await supabase.from("collections").delete().eq("id", collectionId);
    }

    setRecentUndo(null);
    toast.success("Collection undone");
  };

  // Filter for Today's view
  const todayFiltered = activeWithCollections
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => planFilter === "All" || s.plan === planFilter);

  const remainingTotal = todayFiltered.reduce((sum, s) => {
    const allowance = planCollections[s.plan] || 0;
    const used = getCollectionCount(s.id);
    return sum + Math.max(0, allowance - used);
  }, 0);

  // Print collection sheet
  const printSheet = () => {
    // Group subscribers by plan
    const grouped: Record<string, typeof activeWithCollections> = {};
    activeWithCollections.forEach(s => {
      if (!grouped[s.plan]) grouped[s.plan] = [];
      grouped[s.plan].push(s);
    });

    const monthLabel = new Date(monthFilter + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    let html = `<!DOCTYPE html><html><head><title>Collection Sheet - ${monthLabel}</title>
    <style>
      @media print { body { margin: 0; } @page { size: A4 portrait; margin: 15mm; } }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; max-width: 700px; margin: 0 auto; padding: 20px; }
      h1 { font-size: 22px; margin: 0; font-weight: 700; }
      .subtitle { font-size: 14px; color: #666; margin-top: 4px; }
      .plan-section { margin-top: 24px; }
      .plan-header { font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 2px solid #111; margin-bottom: 2px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 8px 4px; border-bottom: 1px solid #ddd; font-size: 15px; }
      td:first-child { font-weight: 500; }
      .checkbox { display: inline-block; width: 22px; height: 22px; border: 2px solid #333; margin-right: 8px; text-align: center; line-height: 18px; font-size: 14px; }
      .checked { background: #f0f0f0; }
      .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 12px; color: #999; display: flex; justify-content: space-between; }
      .totals { margin-top: 20px; font-size: 13px; color: #666; }
    </style></head><body>`;

    html += `<h1>${settings.businessName || "Collection Sheet"}</h1>`;
    html += `<p class="subtitle">${monthLabel} Collection Sheet</p>`;

    let totalSubs = 0;
    let totalAllowance = 0;

    Object.entries(grouped).forEach(([planName, subs]) => {
      const plan = plans.find(p => p.name === planName);
      if (!plan || plan.collectionsPerMonth === 0) return;
      const allowance = plan.collectionsPerMonth;

      html += `<div class="plan-section">`;
      html += `<div class="plan-header">${planName} (£${plan.priceNum}/mo — ${allowance} collection${allowance > 1 ? "s" : ""})</div>`;
      html += `<table>`;

      subs.sort((a, b) => {
        // Sort by surname
        const aLast = a.name.split(" ").pop() || a.name;
        const bLast = b.name.split(" ").pop() || b.name;
        return aLast.localeCompare(bLast);
      }).forEach(sub => {
        const used = getCollectionCount(sub.id);
        html += `<tr><td>${sub.name}</td><td style="text-align:right;">`;
        for (let i = 0; i < allowance; i++) {
          html += `<span class="checkbox ${i < used ? 'checked' : ''}">${i < used ? "✓" : ""}</span>`;
        }
        html += `</td></tr>`;
        totalSubs++;
        totalAllowance += allowance;
      });

      html += `</table></div>`;
    });

    html += `<div class="totals">Total subscribers: ${totalSubs} | Total collections available: ${totalAllowance}</div>`;
    html += `<div class="footer"><span>Powered by Slate</span><span>${monthLabel}</span></div>`;
    html += `</body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 300);
    }
  };

  // Send reminders
  const sendReminders = async () => {
    setSending(true);
    const eligibleSubs = activeWithCollections.filter(s => {
      const allowance = planCollections[s.plan] || 0;
      const used = getCollectionCount(s.id);
      return used < allowance;
    });

    if (!demoActive && producerId) {
      try {
        const { error } = await supabase.functions.invoke("send-collection-reminders", {
          body: { producer_id: producerId },
        });
        if (error) throw error;
        toast.success(`Reminders sent to ${eligibleSubs.length} subscribers`);
      } catch {
        toast.error("Failed to send reminders");
      }
    } else {
      toast.success(`Reminders sent to ${eligibleSubs.length} subscribers (demo)`);
    }
    setSending(false);
    setSendConfirm(false);
  };

  // Month options for report
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    monthOptions.push({ val, label });
  }

  const collectionsWithPlans = plans.filter(p => p.collectionsPerMonth > 0);

  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <DashboardLayout
      title="Collections"
      subtitle={todayLabel}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printSheet}>
            <Printer className="h-4 w-4 mr-1.5" /> Print Sheet
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSendConfirm(true)}>
            <Send className="h-4 w-4 mr-1.5" /> Send Reminders
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="today">
        <TabsList className="mb-5">
          <TabsTrigger value="today">Today's Collections</TabsTrigger>
          <TabsTrigger value="report">Monthly Report</TabsTrigger>
        </TabsList>

        {/* ===== TODAY'S COLLECTIONS ===== */}
        <TabsContent value="today">
          {collectionsWithPlans.length === 0 ? (
            <Card className="border-0 shadow-card">
              <CardContent className="py-16 text-center">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-[16px] font-medium text-foreground mb-2">No collection plans set up</p>
                <p className="text-[14px] text-muted-foreground">Add collection allowances to your plans first.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-[14px] text-muted-foreground mb-4">
                {remainingTotal} collection{remainingTotal !== 1 ? "s" : ""} remaining this month across {todayFiltered.length} subscriber{todayFiltered.length !== 1 ? "s" : ""}
              </p>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full h-12 pl-9 pr-3 rounded-lg border border-border bg-white text-[16px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                  />
                </div>
                <select
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className="h-12 px-3 rounded-lg border border-border bg-white text-[14px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                >
                  <option value="All">All Plans</option>
                  {collectionsWithPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* Undo bar */}
              {recentUndo && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber/10 border border-amber/20">
                  <span className="text-[14px] text-foreground flex-1">Collection recorded</span>
                  <Button variant="outline" size="sm" onClick={undoCollection}>
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
                  </Button>
                </div>
              )}

              {/* Subscriber list */}
              <div className="space-y-2">
                {todayFiltered.map(sub => {
                  const allowance = planCollections[sub.plan] || 0;
                  const used = getCollectionCount(sub.id);
                  const remaining = allowance - used;
                  const allDone = remaining <= 0;
                  const progress = allowance > 0 ? (used / allowance) * 100 : 0;

                  return (
                    <Card key={sub.id} className="border-0 shadow-card">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[18px] font-medium text-foreground truncate">{sub.name}</p>
                          <p className="text-[13px] text-muted-foreground">{sub.plan}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Progress value={progress} className="h-2 flex-1 max-w-[160px]" />
                            <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                              {used} of {allowance} collected
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => markCollected(sub)}
                          disabled={allDone}
                          className="h-12 px-5 text-[14px] font-medium shrink-0"
                          variant={allDone ? "outline" : "slate"}
                        >
                          {allDone ? "All collected ✓" : "Mark Collected"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}

                {todayFiltered.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[14px] text-muted-foreground">No subscribers match your search</p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== MONTHLY REPORT ===== */}
        <TabsContent value="report">
          <div className="flex items-center gap-3 mb-5">
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-white text-[14px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
            >
              {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <p className="text-[12px] text-muted-foreground font-medium">Collections Made</p>
                <p className="text-[22px] font-semibold text-foreground">
                  {collections.reduce((s, c) => s + c.count, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <p className="text-[12px] text-muted-foreground font-medium">Collections Remaining</p>
                <p className="text-[22px] font-semibold text-foreground">
                  {activeWithCollections.reduce((sum, s) => {
                    const allowance = planCollections[s.plan] || 0;
                    const used = getCollectionCount(s.id);
                    return sum + Math.max(0, allowance - used);
                  }, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <p className="text-[12px] text-muted-foreground font-medium">Subscribers with Collections</p>
                <p className="text-[22px] font-semibold text-foreground">{activeWithCollections.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed table */}
          <Card className="border-0 shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wide p-4">Name</th>
                      <th className="text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wide p-4">Plan</th>
                      <th className="text-center text-[12px] font-medium text-muted-foreground uppercase tracking-wide p-4">Allowance</th>
                      <th className="text-center text-[12px] font-medium text-muted-foreground uppercase tracking-wide p-4">Used</th>
                      <th className="text-center text-[12px] font-medium text-muted-foreground uppercase tracking-wide p-4">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeWithCollections.map(sub => {
                      const allowance = planCollections[sub.plan] || 0;
                      const used = getCollectionCount(sub.id);
                      const remaining = Math.max(0, allowance - used);
                      return (
                        <tr key={sub.id} className="border-b last:border-0">
                          <td className="p-4 text-[15px] font-medium text-foreground">{sub.name}</td>
                          <td className="p-4 text-[13px] text-muted-foreground">{sub.plan}</td>
                          <td className="p-4 text-center text-[14px] text-foreground">{allowance}</td>
                          <td className="p-4 text-center text-[14px] text-foreground">{used}</td>
                          <td className="p-4 text-center">
                            <span className={`text-[14px] font-medium ${remaining === 0 ? "text-success" : "text-foreground"}`}>
                              {remaining === 0 ? "Complete ✓" : remaining}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={sendConfirm}
        onClose={() => setSendConfirm(false)}
        onConfirm={sendReminders}
        title="Send collection reminders"
        description={`Send collection reminders to ${activeWithCollections.filter(s => getCollectionCount(s.id) < (planCollections[s.plan] || 0)).length} subscribers with remaining collections?`}
        confirmText={sending ? "Sending..." : "Send reminders"}
      />
    </DashboardLayout>
  );
};

export default Collections;
