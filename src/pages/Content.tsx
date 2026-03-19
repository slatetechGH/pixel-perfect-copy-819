import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Sparkles, Trash2 } from "lucide-react";
import { useDashboard, ContentItem } from "@/contexts/DashboardContext";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  Recipe: "bg-foreground/10 text-foreground",
  Update: "bg-amber/10 text-amber-hover",
  Story: "bg-success/10 text-success",
  Tip: "bg-info/10 text-info",
};

const Content = () => {
  const { content, setContent, plans } = useDashboard();
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);

  const openEditor = (item?: ContentItem) => {
    if (item) {
      setEditing({
        ...item,
        ingredients: item.ingredients ? item.ingredients.map(i => ({ ...i })) : [],
        methodSteps: item.methodSteps ? [...item.methodSteps] : [],
        eligiblePlans: [...item.eligiblePlans],
      });
      setIsNew(false);
    } else {
      setEditing({
        id: crypto.randomUUID(), title: "", type: "Recipe", body: "", status: "draft", tier: "Free",
        views: 0, date: "—", ai: false, eligiblePlans: [],
        ingredients: [{ quantity: "", name: "" }], methodSteps: [""],
      });
      setIsNew(true);
    }
  };

  const updateField = (field: keyof ContentItem, value: any) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const save = (publish: boolean) => {
    if (!editing || !editing.title) { toast.error("Title is required"); return; }
    setSaving(true);
    setTimeout(() => {
      const updated = {
        ...editing,
        status: (publish ? "published" : "draft") as "published" | "draft",
        date: publish ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
      };
      if (isNew) setContent(prev => [...prev, updated]);
      else setContent(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSaving(false);
      setEditing(null);
      toast.success(publish ? "Published!" : "Saved as draft");
    }, 400);
  };

  const deleteItem = (item: ContentItem) => {
    setContent(prev => prev.filter(c => c.id !== item.id));
    setEditing(null);
    toast.success("Content deleted");
  };

  return (
    <DashboardLayout
      title="Content"
      subtitle="Recipes & guides for your members"
      actions={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => toast("AI content generation coming soon!")}>
            <Sparkles className="h-4 w-4 mr-1.5" /> AI Generate
          </Button>
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-1.5" /> New Post</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {content.map((r) => (
          <Card key={r.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer" onClick={() => openEditor(r)}>
            <CardContent className="p-0">
              <div className="h-36 bg-secondary rounded-t-[14px] flex items-center justify-center text-4xl">🐟</div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${typeColors[r.type] || "bg-secondary text-muted-foreground"}`}>{r.type}</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${r.status === "published" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{r.status}</span>
                </div>
                <p className="text-[15px] font-medium text-foreground mb-2 line-clamp-2">{r.title}</p>
                <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                  <span>{r.date}</span>
                  {r.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SlideOverPanel open={!!editing} onClose={() => setEditing(null)} title={isNew ? "New Post" : "Edit Post"}>
        {editing && (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Title <span className="text-amber">*</span></label>
              <input value={editing.title} onChange={e => updateField("title", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Type</label>
              <select value={editing.type} onChange={e => updateField("type", e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] appearance-none focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all">
                {["Recipe", "Update", "Story", "Tip"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Body</label>
              <textarea value={editing.body} onChange={e => updateField("body", e.target.value)} rows={12} className="w-full px-4 py-3 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none" />
            </div>

            {editing.type === "Recipe" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Prep Time</label>
                    <input value={editing.prepTime || ""} onChange={e => updateField("prepTime", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Cook Time</label>
                    <input value={editing.cookTime || ""} onChange={e => updateField("cookTime", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Serves</label>
                    <input value={editing.serves || ""} onChange={e => updateField("serves", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Ingredients</label>
                  <div className="space-y-2">
                    {(editing.ingredients || []).map((ing, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={ing.quantity} onChange={e => { const ings = [...(editing.ingredients || [])]; ings[i] = { ...ings[i], quantity: e.target.value }; updateField("ingredients", ings); }} placeholder="Qty" className="w-20 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                        <input value={ing.name} onChange={e => { const ings = [...(editing.ingredients || [])]; ings[i] = { ...ings[i], name: e.target.value }; updateField("ingredients", ings); }} placeholder="Ingredient" className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
                        <button onClick={() => updateField("ingredients", (editing.ingredients || []).filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => updateField("ingredients", [...(editing.ingredients || []), { quantity: "", name: "" }])} className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer">+ Add ingredient</button>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Method Steps</label>
                  <div className="space-y-2">
                    {(editing.methodSteps || []).map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-[13px] text-muted-foreground mt-3 w-6">{i + 1}.</span>
                        <textarea value={step} onChange={e => { const steps = [...(editing.methodSteps || [])]; steps[i] = e.target.value; updateField("methodSteps", steps); }} rows={2} className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none" />
                        <button onClick={() => updateField("methodSteps", (editing.methodSteps || []).filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer mt-2"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => updateField("methodSteps", [...(editing.methodSteps || []), ""])} className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer">+ Add step</button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Eligible Plans</label>
              <div className="space-y-2">
                {plans.filter(p => p.active).map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={editing.eligiblePlans.includes(p.name)} onChange={() => {
                      const ep = editing.eligiblePlans.includes(p.name)
                        ? editing.eligiblePlans.filter(x => x !== p.name)
                        : [...editing.eligiblePlans, p.name];
                      updateField("eligiblePlans", ep);
                    }} className="w-[18px] h-[18px] rounded accent-foreground" />
                    <span className="text-[14px] text-foreground">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-5 mt-6 space-y-3">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => save(false)} disabled={saving}>{saving ? "Saving..." : "Save as draft"}</Button>
                <Button variant="slate" onClick={() => save(true)} disabled={saving}>{saving ? "Publishing..." : "Publish"}</Button>
              </div>
              {!isNew && (
                <button onClick={() => setDeleteConfirm(editing)} className="text-[13px] text-destructive/80 hover:text-destructive cursor-pointer">Delete</button>
              )}
            </div>
          </div>
        )}
      </SlideOverPanel>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && deleteItem(deleteConfirm)} title="Delete content" description={`This will permanently delete "${deleteConfirm?.title}".`} confirmText="Delete" destructive />
    </DashboardLayout>
  );
};

export default Content;
