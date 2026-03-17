import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const drops = [
  { id: 1, title: "Wild Turbot — Members Only", status: "active", total: 30, remaining: 18, price: "£28.00", revenue: "£336", endsIn: "2 days" },
  { id: 2, title: "Dry-Aged Halibut Steaks", status: "scheduled", total: 20, remaining: 20, price: "£22.00", revenue: "£0", endsIn: "Starts in 3 days" },
  { id: 3, title: "Smoked Salmon Selection Box", status: "sold_out", total: 50, remaining: 0, price: "£35.00", revenue: "£1,750", endsIn: "Ended" },
  { id: 4, title: "Cornish Crab Meat — 500g", status: "ended", total: 25, remaining: 4, price: "£18.00", revenue: "£378", endsIn: "Ended" },
];

const statusDot: Record<string, string> = {
  active: "bg-success",
  scheduled: "bg-amber",
  sold_out: "bg-primary",
  ended: "bg-muted-foreground",
};

const Drops = () => (
  <DashboardLayout
    title="Product Drops"
    subtitle="Limited-availability releases"
    actions={
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1.5" /> Create Drop
      </Button>
    }
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {drops.map((d) => (
        <Card key={d.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-start justify-between">
              <CardTitle className="text-[15px] font-medium">{d.title}</CardTitle>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
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
            <div className="flex items-center gap-1 text-caption text-muted-foreground">
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
