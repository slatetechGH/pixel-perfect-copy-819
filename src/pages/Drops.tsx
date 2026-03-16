import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const drops = [
  {
    id: 1,
    title: "Wild Turbot — Members Only",
    status: "active",
    total: 30,
    remaining: 18,
    price: "£28.00",
    revenue: "£336",
    endsIn: "2 days",
  },
  {
    id: 2,
    title: "Dry-Aged Halibut Steaks",
    status: "scheduled",
    total: 20,
    remaining: 20,
    price: "£22.00",
    revenue: "£0",
    endsIn: "Starts in 3 days",
  },
  {
    id: 3,
    title: "Smoked Salmon Selection Box",
    status: "sold_out",
    total: 50,
    remaining: 0,
    price: "£35.00",
    revenue: "£1,750",
    endsIn: "Ended",
  },
  {
    id: 4,
    title: "Cornish Crab Meat — 500g",
    status: "ended",
    total: 25,
    remaining: 4,
    price: "£18.00",
    revenue: "£378",
    endsIn: "Ended",
  },
];

const statusStyle = (s: string) => {
  if (s === "active") return "bg-success/10 text-success";
  if (s === "scheduled") return "bg-info/10 text-info";
  if (s === "sold_out") return "bg-accent/10 text-accent";
  return "bg-muted text-muted-foreground";
};

const Drops = () => (
  <DashboardLayout
    title="Product Drops"
    subtitle="Limited-availability releases"
    actions={
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" /> Create Drop
      </Button>
    }
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {drops.map((d) => (
        <Card key={d.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base font-display">{d.title}</CardTitle>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(d.status)}`}>
                {d.status.replace("_", " ")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Price: <span className="text-foreground font-medium">{d.price}</span></span>
              <span className="text-muted-foreground">Revenue: <span className="text-foreground font-medium">{d.revenue}</span></span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{d.total - d.remaining}/{d.total} sold</span>
                <span>{Math.round(((d.total - d.remaining) / d.total) * 100)}%</span>
              </div>
              <Progress value={((d.total - d.remaining) / d.total) * 100} className="h-2" />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {d.endsIn}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </DashboardLayout>
);

export default Drops;
