import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-1" /> AI Generate
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Recipe
        </Button>
      </div>
    }
  >
    <div className="grid gap-3">
      {recipes.map((r) => (
        <Card key={r.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg">🐟</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  {r.ai && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Sparkles className="h-3 w-3" /> AI
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <Badge
                    variant={r.status === "published" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {r.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{r.tier} tier</span>
                  {r.views > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {r.views}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{r.date}</span>
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
