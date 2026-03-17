import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Sparkles } from "lucide-react";

const recipes = [
  { id: 1, title: "Pan-Seared Sea Bass with Lemon Butter", status: "published", tier: "Standard", views: 142, date: "12 Mar 2026", ai: false },
  { id: 2, title: "Smoked Mackerel Pâté", status: "published", tier: "Free", views: 289, date: "8 Mar 2026", ai: false },
  { id: 3, title: "Lobster Thermidor", status: "published", tier: "Premium", views: 67, date: "5 Mar 2026", ai: true },
  { id: 4, title: "Simple Fish Pie", status: "draft", tier: "Standard", views: 0, date: "—", ai: false },
  { id: 5, title: "Grilled Sardines with Salsa Verde", status: "published", tier: "Free", views: 198, date: "28 Feb 2026", ai: true },
  { id: 6, title: "Crab Linguine", status: "draft", tier: "Premium", views: 0, date: "—", ai: false },
];

const Content = () => (
  <DashboardLayout
    title="Content"
    subtitle="Recipes & guides for your members"
    actions={
      <div className="flex gap-3">
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-1.5" /> AI Generate
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Recipe
        </Button>
      </div>
    }
  >
    <div className="grid gap-3">
      {recipes.map((r) => (
        <Card key={r.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-lg">🐟</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-foreground">{r.title}</p>
                  {r.ai && (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary">
                      <Sparkles className="h-3 w-3" /> AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    r.status === "published" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{r.tier} tier</span>
                  {r.views > 0 && (
                    <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {r.views}
                    </span>
                  )}
                  <span className="text-[12px] text-muted-foreground font-light">{r.date}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </DashboardLayout>
);

export default Content;
