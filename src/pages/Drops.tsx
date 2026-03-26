import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Trash2, Copy, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDashboard, Drop, DropItem } from "@/contexts/DashboardContext";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useTierLimits } from "@/hooks/useTierLimits";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { toast } from "sonner";

const statusDot: Record<string, string> = {
  live: "bg-success", scheduled: "bg-amber", sold_out: "bg-foreground", ended: "bg-muted-foreground", draft: "bg-muted-foreground",
};
const statusFilters = ["All", "Draft", "Scheduled", "Live", "Ended"] as const;

const emptyDrop: Omit<Drop, "id"> = {
  title: "", description: "", status: "draft" as const, total: 10, remaining: 10, price: "£0.00", priceNum: 0,
  revenue: "£0", endsIn: "—", dropDate: "", dropTime: "09:00", endDate: "", endTime: "18:00",
  eligiblePlans: [], items: [{ name: "", quantity: "" }], notify: true,
};

const Drops = () => {
  const { drops, setDrops, plans } = useDashboard();
  const { canCreateDrops } = useTierLimits();
  const [filter, setFilter] = useState<string>("All");
  const [editing, setEditing] = useState<Drop | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Drop | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Drop | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = filter === "All" ? drops : drops.filter(d => d.status === filter.toLowerCase());

  const openEditor = (drop?: Drop) => {
    if (drop) { setEditing({ ...drop, items: drop.items.map(i => ({ ...i })), eligiblePlans: [...drop.eligiblePlans] }); setIsNew(false); }
    else { setEditing({ ...emptyDrop, id: crypto.randomUUID(), items: [{ name: "", quantity: "" }], eligiblePlans: [] } as Drop); setIsNew(true); }
  };

  const updateField = (field: keyof Drop, value: any) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const updateItem = (index: number, field: keyof DropItem, value: string) => {
    if (!editing) return;
    const items = [...editing.items];
    items[index] = { ...items[index], [field]: value };
    setEditing({ ...editing, items });
  };

  const togglePlan = (planName: string) => {
    if (!editing) return;
    const ep = editing.eligiblePlans.includes(planName)
      ? editing.eligiblePlans.filter(p => p !== planName)
      : [...editing.eligiblePlans, planName];
    setEditing({ ...editing, eligiblePlans: ep });
  };

  const save = (asDraft: boolean) => {
    if (!editing || !editing.title) { toast.error("Drop name is required"); return; }
    setSaving(true);
    setTimeout(() => {
      const status = asDraft ? "draft" : (editing.dropDate ? "scheduled" : "draft");
      const updated = { ...editing, status: status as Drop["status"], price: `£${editing.priceNum.toFixed(2)}` };
      if (isNew) setDrops(prev => [...prev, updated]);
      else setDrops(prev => prev.map(d => d.id === updated.id ? updated : d));
      setSaving(false);
      setEditing(null);
      toast.success(isNew ? "Drop created" : "Drop updated");
    }, 400);
  };

  const duplicate = (drop: Drop) => {
    const dup: Drop = { ...drop, id: crypto.randomUUID(), title: `${drop.title} (Copy)`, status: "draft" as const, remaining: drop.total, revenue: "£0" };
    setDrops(prev => [...prev, dup]);
    toast.success("Drop duplicated");
  };

  const deleteDrop = (drop: Drop) => {
    setDrops(prev => prev.filter(d => d.id !== drop.id));
    setEditing(null);
    toast.success(`"${drop.title}" deleted`);
  };

  const cancelDrop = (drop: Drop) => {
    setDrops(prev => prev.map(d => d.id === drop.id ? { ...d, status: "ended" as const, endsIn: "Cancelled" } : d));
    toast.success(`"${drop.title}" cancelled`);
  };

  if (!canCreateDrops) {
    return (
      <DashboardLayout title="Product Drops" subtitle="Limited-availability releases">
        <div className="text-center py-16 max-w-md mx-auto">
          <Sparkles size={48} className="text-amber mx-auto mb-4" />
          <h3 className="text-[18px] font-semibold text-foreground mb-2">Product drops are available on the Standard plan</h3>
          <p className="text-[14px] text-muted-foreground mb-6">Upgrade to start dropping exclusive products to your subscribers.</p>
          <UpgradeBanner message="Upgrade to Standard to create product drops" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Product Drops"
      subtitle="Limited-availability releases"
      actions={<Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-1.5" /> New Drop</Button>}
    >
      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {statusFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${filter === f ? "bg-foreground text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((d) => (
          <Card key={d.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer" onClick={() => openEditor(d)}>
            <CardHeader className="pb-2 px-6 pt-6">
              <div className="flex items-start justify-between">
                <CardTitle className="text-[15px] font-medium">{d.title}</CardTitle>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground capitalize">
                  <span className={`h-2 w-2 rounded-full ${statusDot[d.status]}`} />
                  {d.status.replace("_", " ")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center justify-between text-[13px] mb-3">
                <span className="text-muted-foreground">Price: <span className="text-foreground font-medium">{d.price}</span></span>
                <span className="text-muted-foreground">Revenue: <span className="text-foreground font-medium">{d.revenue}</span></span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-caption text-muted-foreground mb-1.5">
                  <span>{d.total - d.remaining}/{d.total} sold</span>
                  <span>{Math.round(((d.total - d.remaining) / d.total) * 100)}%</span>
                </div>
                <Progress value={((d.total - d.remaining) / d.total) * 100} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-caption text-muted-foreground">
                  <Clock className="h-3 w-3" />{d.endsIn}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => duplicate(d)} className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Duplicate">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Clock size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-[16px] text-muted-foreground mb-4">No product drops yet</p>
          <Button size="sm" onClick={() => openEditor()}>Create your first drop</Button>
        </div>
      )}

      <SlideOverPanel open={!!editing} onClose={() => setEditing(null)} title={isNew ? "New Drop" : "Edit Drop"}>
        {editing && (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Drop Name <span className="text-amber">*</span></label>
              <input value={editing.title} onChange={e => updateField("title", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Description</label>
              <textarea value={editing.description} onChange={e => updateField("description", e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Drop Date</label>
                <input type="date" value={editing.dropDate} onChange={e => updateField("dropDate", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Time</label>
                <input type="time" value={editing.dropTime} onChange={e => updateField("dropTime", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">End Date</label>
                <input type="date" value={editing.endDate} onChange={e => updateField("endDate", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Time</label>
                <input type="time" value={editing.endTime} onChange={e => updateField("endTime", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Price (£) <span className="text-amber">*</span></label>
                <input type="number" min="0" step="0.01" value={editing.priceNum} onChange={e => updateField("priceNum", parseFloat(e.target.value) || 0)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Available Qty</label>
                <input type="number" min="1" value={editing.total} onChange={e => { const v = parseInt(e.target.value) || 1; updateField("total", v); updateField("remaining", v); }} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Eligible Plans</label>
              <div className="space-y-2">
                {plans.filter(p => p.active).map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={editing.eligiblePlans.includes(p.name)} onChange={() => togglePlan(p.name)} className="w-[18px] h-[18px] rounded accent-foreground" />
                    <span className="text-[14px] text-foreground">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Items Included</label>
              <div className="space-y-2">
                {editing.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item.name} onChange={e => updateItem(i, "name", e.target.value)} placeholder="Item name" className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                    <input value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} placeholder="Qty" className="w-24 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                    {editing.items.length > 1 && (
                      <button onClick={() => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEditing({ ...editing, items: [...editing.items, { name: "", quantity: "" }] })} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">+ Add item</button>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.notify} onChange={e => updateField("notify", e.target.checked)} className="w-[18px] h-[18px] rounded accent-foreground" />
              <span className="text-[14px] text-foreground">Send notification to eligible subscribers</span>
            </label>

            <div className="border-t border-border pt-5 mt-6 space-y-3">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => save(true)} disabled={saving}>{saving ? "Saving..." : "Save as draft"}</Button>
                <Button variant="slate" onClick={() => save(false)} disabled={saving}>{saving ? "Saving..." : "Schedule drop"}</Button>
              </div>
              {!isNew && (
                <div className="flex gap-4">
                  {(editing.status === "scheduled" || editing.status === "live") && (
                    <button onClick={() => setCancelConfirm(editing)} className="text-[13px] text-destructive/80 hover:text-destructive cursor-pointer">Cancel drop</button>
                  )}
                  {editing.status === "draft" && (
                    <button onClick={() => setDeleteConfirm(editing)} className="text-[13px] text-destructive/80 hover:text-destructive cursor-pointer">Delete drop</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOverPanel>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && deleteDrop(deleteConfirm)} title="Delete drop" description={`This will permanently delete "${deleteConfirm?.title}".`} confirmText="Delete" destructive />
      <ConfirmDialog open={!!cancelConfirm} onClose={() => setCancelConfirm(null)} onConfirm={() => cancelConfirm && cancelDrop(cancelConfirm)} title="Cancel drop" description={`This will cancel "${cancelConfirm?.title}" and notify subscribers.`} confirmText="Cancel drop" destructive />
    </DashboardLayout>
  );
};

export default Drops;
