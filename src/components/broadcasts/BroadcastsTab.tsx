import { useState } from "react";
import { Megaphone, Plus, Send, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BroadcastCompose } from "./BroadcastCompose";
import type { Broadcast, Contact } from "@/pages/Broadcasts";
import type { Plan, Subscriber } from "@/contexts/DashboardContext";
import { format } from "date-fns";

interface Props {
  broadcasts: Broadcast[];
  contacts: Contact[];
  plans: Plan[];
  subscribers: Subscriber[];
  producerId: string;
  loading: boolean;
  onRefresh: () => void;
}

export function BroadcastsTab({ broadcasts, contacts, plans, subscribers, producerId, loading, onRefresh }: Props) {
  const [composing, setComposing] = useState(false);

  if (composing) {
    return (
      <BroadcastCompose
        contacts={contacts}
        plans={plans}
        subscribers={subscribers}
        producerId={producerId}
        onCancel={() => setComposing(false)}
        onSent={() => { setComposing(false); onRefresh(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <Button onClick={() => setComposing(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Broadcast
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
      ) : broadcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-[17px] font-semibold text-foreground mb-1">You haven't sent a broadcast yet</h3>
          <p className="text-[14px] text-muted-foreground mb-5">Reach your audience with one click.</p>
          <Button onClick={() => setComposing(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Broadcast
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map(b => {
            const segments = (b.target_segments || []) as string[];
            const audienceLabel = segments.length === 0 ? "No audience" :
              segments.length >= (plans.length + 1) ? "Everyone" :
              segments.join(", ");
            return (
              <div key={b.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="shrink-0">
                  {b.status === "sent" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : b.status === "failed" ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{b.subject}</p>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground">
                    <span>{b.sent_at ? format(new Date(b.sent_at), "d MMM yyyy, HH:mm") : "Draft"}</span>
                    <span>·</span>
                    <span className="truncate">{audienceLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground">{b.recipient_count}</span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  b.status === "sent" ? "bg-success/10 text-success" :
                  b.status === "failed" ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {b.status === "sent" ? "Sent" : b.status === "failed" ? "Failed" : "Draft"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
