import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send } from "lucide-react";

const messages = [
  { id: 1, subject: "Welcome to The Harbour Fish Co. 🐟", target: "All tiers", sent: "12 Mar 2026", opens: "82%", channel: "Email" },
  { id: 2, subject: "Wild Turbot Drop — Live Now!", target: "Premium", sent: "10 Mar 2026", opens: "94%", channel: "Email + Push" },
  { id: 3, subject: "March Catch Report", target: "Standard + Premium", sent: "1 Mar 2026", opens: "71%", channel: "Email" },
  { id: 4, subject: "Renewal Reminder", target: "All tiers", sent: "28 Feb 2026", opens: "65%", channel: "Email" },
  { id: 5, subject: "February Recipe Roundup", target: "All tiers", sent: "25 Feb 2026", opens: "58%", channel: "Email" },
];

const Messages = () => (
  <DashboardLayout
    title="Messages"
    subtitle="Broadcast to your members"
    actions={
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" /> Compose
      </Button>
    }
  >
    <div className="space-y-3">
      {messages.map((m) => (
        <Card key={m.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{m.subject}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{m.target}</span>
                  <Badge variant="secondary" className="text-xs">{m.channel}</Badge>
                  <span className="text-xs text-muted-foreground">{m.sent}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{m.opens}</p>
              <p className="text-xs text-muted-foreground">open rate</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </DashboardLayout>
);

export default Messages;
