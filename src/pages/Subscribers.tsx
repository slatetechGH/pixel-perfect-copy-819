import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, MoreHorizontal } from "lucide-react";

const subscribers = [
  { id: 1, name: "Sarah Mitchell", email: "sarah@email.com", tier: "Premium", joined: "12 Jan 2026", status: "active", ltv: "£384" },
  { id: 2, name: "James Chen", email: "james.chen@email.com", tier: "Standard", joined: "3 Feb 2026", status: "active", ltv: "£120" },
  { id: 3, name: "Emma Davies", email: "emma.d@email.com", tier: "Standard", joined: "15 Nov 2025", status: "cancelled", ltv: "£195" },
  { id: 4, name: "Oliver Thompson", email: "oliver.t@email.com", tier: "Premium", joined: "22 Dec 2025", status: "active", ltv: "£310" },
  { id: 5, name: "Amelia Wright", email: "amelia@email.com", tier: "Free", joined: "8 Mar 2026", status: "active", ltv: "£0" },
  { id: 6, name: "William Harris", email: "will.h@email.com", tier: "Premium", joined: "1 Oct 2025", status: "active", ltv: "£520" },
  { id: 7, name: "Isabelle Foster", email: "isabelle.f@email.com", tier: "Standard", joined: "14 Feb 2026", status: "paused", ltv: "£75" },
  { id: 8, name: "George Baker", email: "george.b@email.com", tier: "Standard", joined: "20 Jan 2026", status: "active", ltv: "£150" },
];

const statusDot: Record<string, string> = {
  active: "bg-success",
  paused: "bg-amber",
  cancelled: "bg-destructive/80",
};

const Subscribers = () => (
  <DashboardLayout
    title="Subscribers"
    subtitle="187 total subscribers"
    actions={
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-1.5" /> Export CSV
      </Button>
    }
  >
    <Card className="border-0 shadow-card">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search subscribers..." className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">Name</th>
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">Email</th>
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">Tier</th>
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">Joined</th>
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">Status</th>
                <th className="text-left text-caption font-medium text-muted-foreground uppercase tracking-[0.05em] p-4">LTV</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b last:border-0 hover:bg-background/60 transition-colors duration-150">
                  <td className="p-4 text-[15px] font-medium text-foreground">{sub.name}</td>
                  <td className="p-4 text-[13px] text-muted-foreground">{sub.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-secondary text-foreground">
                      {sub.tier}
                    </span>
                  </td>
                  <td className="p-4 text-[13px] text-muted-foreground">{sub.joined}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${statusDot[sub.status] || "bg-muted-foreground"}`} />
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-[15px] font-medium text-foreground">{sub.ltv}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </DashboardLayout>
);

export default Subscribers;
