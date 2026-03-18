import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Check, Trash2 } from "lucide-react";
import { useDashboard, Plan } from "@/contexts/DashboardContext";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const emptyPlan: Omit<Plan, "id"> = {
  name: "", price: "Free", priceNum: 0, subscribers: 0, isFree: false,
  benefits: [""], description: "", active: true, showOnPublicPage: true,
};

const Plans = () => {
  const { plans, setPlans } = useDashboard();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Plan | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  const openEditor = (plan?: Plan) => {
    if (plan) { setEditing({ ...plan, benefits: [...plan.benefits] }); setIsNew(false); }
    else { setEditing({ ...emptyPlan, id: Date.now(), benefits: [""] } as Plan); setIsNew(true); }
  };

  const updateField = (field: keyof Plan, value: any) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const updateBenefit = (index: number, value: string) => {
    if (!editing) return;
    const b = [...editing.benefits];
    b[index] = value;
    setEditing({ ...editing, benefits: b });
  };

  const removeBenefit = (index: number) => {
    if (!editing || editing.benefits.length <= 1) return;
    setEditing({ ...editing, benefits: editing.benefits.filter((_, i) => i !== index) });
  };

  const save = () => {
    if (!editing || !editing.name) { toast.error("Plan name is required"); return; }
    setSaving(true);
    setTimeout(() => {
      const updated = { ...editing, price: editing.priceNum === 0 ? "Free" : `£${editing.priceNum}/mo`, isFree: editing.priceNum === 0 };
      if (isNew) setPlans(prev => [...prev, updated]);
      else setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSaving(false);
      setEditing(null);
      toast.success(isNew ? "Plan created" : "Plan updated");
    }, 400);
  };

  const deletePlan = (plan: Plan) => {
    setPlans(prev => prev.filter(p => p.id !== plan.id));
    setEditing(null);
    toast.success(`"${plan.name}" deleted`);
  };

  const toggleActive = (plan: Plan) => {
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, active: !p.active } : p));
    toast.success(`"${plan.name}" ${plan.active ? "deactivated" : "activated"}`);
  };

  return (
    <DashboardLayout
      title="Plans"
      subtitle="Manage your membership tiers"
      actions={<Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-1.5" /> Create Plan</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            {plan.priceNum === 35 && (
              <div className="absolute top-0 right-0 bg-foreground text-white text-[11px] font-medium px-3 py-1 rounded-bl-lg">Popular</div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-medium">{plan.name}</CardTitle>
              <p className="text-metric text-foreground">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 mb-4 text-[13px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{plan.subscribers} subscribers</span>
              </div>
              <ul className="space-y-2.5 mb-5">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />{b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditor(plan)}>Edit</Button>
                <button
                  onClick={() => setToggleConfirm(plan)}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium cursor-pointer transition-colors ${
                    plan.active ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.active ? "Active" : "Inactive"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add plan card */}
        <button
          onClick={() => openEditor()}
          className="border-2 border-dashed border-border rounded-[14px] flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-muted-foreground/40 transition-colors cursor-pointer"
        >
          <Plus size={32} className="text-muted-foreground" />
          <span className="text-[15px] font-medium text-muted-foreground">Create new plan</span>
        </button>
      </div>

      {/* Editor Slide-Over */}
      <SlideOverPanel open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Create Plan" : "Edit Plan"}>
        {editing && (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Plan Name <span className="text-amber">*</span></label>
              <input value={editing.name} onChange={e => updateField("name", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Monthly Price (£) <span className="text-amber">*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-muted-foreground">£</span>
                <input type="number" min="0" step="0.50" value={editing.priceNum} onChange={e => updateField("priceNum", parseFloat(e.target.value) || 0)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Description</label>
              <textarea value={editing.description} onChange={e => updateField("description", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Features / Benefits</label>
              <div className="space-y-2">
                {editing.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={b} onChange={e => updateBenefit(i, e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                    {editing.benefits.length > 1 && (
                      <button onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEditing({ ...editing, benefits: [...editing.benefits, ""] })} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">+ Add feature</button>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Subscriber Limit</label>
              <input type="number" value={editing.subscriberLimit || ""} onChange={e => updateField("subscriberLimit", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Leave blank for unlimited" className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.showOnPublicPage} onChange={e => updateField("showOnPublicPage", e.target.checked)} className="w-[18px] h-[18px] rounded accent-foreground" />
              <span className="text-[14px] text-foreground">Show on public page</span>
            </label>

            <div className="border-t border-border pt-5 mt-6 flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="slate" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
              </div>
            </div>
            {!isNew && (
              <button onClick={() => setDeleteConfirm(editing)} className="text-[13px] text-destructive/80 hover:text-destructive transition-colors cursor-pointer">
                Delete plan
              </button>
            )}
          </div>
        )}
      </SlideOverPanel>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deletePlan(deleteConfirm)}
        title="Delete plan"
        description={`This will permanently delete "${deleteConfirm?.name}". ${deleteConfirm?.subscribers || 0} subscribers will need to be migrated.`}
        confirmText="Delete plan"
        destructive
      />
      <ConfirmDialog
        open={!!toggleConfirm}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => toggleConfirm && toggleActive(toggleConfirm)}
        title={toggleConfirm?.active ? "Deactivate plan" : "Activate plan"}
        description={`${toggleConfirm?.active ? "Deactivating" : "Activating"} "${toggleConfirm?.name}" will ${toggleConfirm?.active ? "hide it from new subscribers" : "make it available to new subscribers"}.`}
        confirmText={toggleConfirm?.active ? "Deactivate" : "Activate"}
      />
    </DashboardLayout>
  );
};

export default Plans;
