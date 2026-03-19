import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronDown } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const statusDot: Record<string, string> = {
  active: "bg-success", paused: "bg-amber", cancelled: "bg-destructive/80",
};

const Subscribers = () => {
  const { subscribers, setSubscribers, plans } = useDashboard();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [selected, setSelected] = useState<number | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [pauseConfirm, setPauseConfirm] = useState<number | null>(null);

  const filtered = subscribers
    .filter(s => (s.name + s.email).toLowerCase().includes(search.toLowerCase()))
    .filter(s => planFilter === "All" || s.plan === planFilter)
    .filter(s => statusFilter === "All" || s.status === statusFilter)
    .sort((a, b) => {
      if (sort === "Alphabetical") return a.name.localeCompare(b.name);
      if (sort === "Oldest") return a.id - b.id;
      return b.id - a.id;
    });

  const selectedSub = subscribers.find(s => s.id === selected);

  const changePlan = (subId: number, newPlan: string) => {
    setSubscribers(prev => prev.map(s => s.id === subId ? { ...s, plan: newPlan } : s));
    toast.success("Plan updated");
  };

  const cancelSub = (subId: number) => {
    setSubscribers(prev => prev.map(s => s.id === subId ? { ...s, status: "cancelled" as const } : s));
    setSelected(null);
    toast.success("Subscription cancelled");
  };

  const pauseSub = (subId: number) => {
    setSubscribers(prev => prev.map(s => s.id === subId ? { ...s, status: "paused" as const } : s));
    toast.success("Subscription paused");
  };

  const resumeSub = (subId: number) => {
    setSubscribers(prev => prev.map(s => s.id === subId ? { ...s, status: "active" as const } : s));
    toast.success("Subscription resumed");
  };

  return (
    <DashboardLayout
      title="Subscribers"
      subtitle={`${filtered.length} of ${subscribers.length} subscribers`}
      actions={<Button variant="outline" size="sm" onClick={() => toast("Export coming soon")}><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>}
    >
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-white text-[14px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all">
              <option value="All">All Plans</option>
              {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-white text-[14px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all">
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-white text-[14px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all">
              <option>Newest</option>
              <option>Oldest</option>
              <option>Alphabetical</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-[16px] font-medium text-muted-foreground mb-2">No results found</p>
              <p className="text-[14px] text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {["Name", "Email", "Plan", "Joined", "Status", "Revenue", ""].map(h => (
                      <th key={h} className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-background/60 transition-colors duration-150 cursor-pointer" onClick={() => setSelected(sub.id)}>
                      <td className="p-4 text-[15px] font-medium text-foreground">{sub.name}</td>
                      <td className="p-4 text-[13px] text-muted-foreground">{sub.email}</td>
                      <td className="p-4"><span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-secondary text-foreground">{sub.plan}</span></td>
                      <td className="p-4 text-[13px] text-muted-foreground">{sub.joined}</td>
                      <td className="p-4"><span className="flex items-center gap-2 text-[13px] text-muted-foreground capitalize"><span className={`h-2 w-2 rounded-full ${statusDot[sub.status]}`} />{sub.status}</span></td>
                      <td className="p-4 text-[15px] font-medium text-foreground">{sub.revenue}</td>
                      <td className="p-4"><ChevronDown size={16} className="text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriber Detail */}
      <SlideOverPanel open={!!selectedSub} onClose={() => setSelected(null)} title="Subscriber Details">
        {selectedSub && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div><label className="text-[13px] text-muted-foreground">Name</label><p className="text-[15px] font-medium text-foreground">{selectedSub.name}</p></div>
              <div><label className="text-[13px] text-muted-foreground">Email</label><p className="text-[15px] text-foreground">{selectedSub.email}</p></div>
              <div><label className="text-[13px] text-muted-foreground">Phone</label><p className="text-[15px] text-foreground">{selectedSub.phone}</p></div>
              <div><label className="text-[13px] text-muted-foreground">Joined</label><p className="text-[15px] text-foreground">{selectedSub.joined}</p></div>
              <div><label className="text-[13px] text-muted-foreground">Total Revenue</label><p className="text-[15px] font-medium text-foreground">{selectedSub.revenue}</p></div>
              <div>
                <label className="text-[13px] text-muted-foreground">Status</label>
                <span className={`flex items-center gap-2 text-[14px] capitalize mt-1`}>
                  <span className={`h-2 w-2 rounded-full ${statusDot[selectedSub.status]}`} />{selectedSub.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Change Plan</label>
              <select value={selectedSub.plan} onChange={e => changePlan(selectedSub.id, e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] appearance-none focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all">
                {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="slate" onClick={() => { setSelected(null); navigate("/dashboard/messages"); }}>Message</Button>
              {selectedSub.status === "active" && (
                <Button variant="outline" onClick={() => setPauseConfirm(selectedSub.id)}>Pause</Button>
              )}
              {selectedSub.status === "paused" && (
                <Button variant="outline" onClick={() => resumeSub(selectedSub.id)}>Resume</Button>
              )}
              {selectedSub.status !== "cancelled" && (
                <Button variant="outline" className="text-destructive" onClick={() => setCancelConfirm(selectedSub.id)}>Cancel Subscription</Button>
              )}
            </div>
          </div>
        )}
      </SlideOverPanel>

      <ConfirmDialog open={!!cancelConfirm} onClose={() => setCancelConfirm(null)} onConfirm={() => cancelConfirm && cancelSub(cancelConfirm)} title="Cancel subscription" description="This will cancel the subscription. The subscriber will lose access at the end of their billing period." confirmText="Cancel subscription" destructive />
      <ConfirmDialog open={!!pauseConfirm} onClose={() => setPauseConfirm(null)} onConfirm={() => { if (pauseConfirm) pauseSub(pauseConfirm); setPauseConfirm(null); }} title="Pause subscription" description="This will pause the subscription. The subscriber can be resumed at any time." confirmText="Pause subscription" />
    </DashboardLayout>
  );
};

export default Subscribers;
