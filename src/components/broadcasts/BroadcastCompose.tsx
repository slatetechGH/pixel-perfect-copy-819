import { useState, useMemo } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Contact } from "@/pages/Broadcasts";
import type { Plan, Subscriber } from "@/contexts/DashboardContext";

interface Props {
  contacts: Contact[];
  plans: Plan[];
  subscribers: Subscriber[];
  producerId: string;
  onCancel: () => void;
  onSent: () => void;
}

export function BroadcastCompose({ contacts, plans, subscribers, producerId, onCancel, onSent }: Props) {
  const { settings } = useDashboard();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Build segments with counts
  const mailingListCount = contacts.filter(c => !c.plan_id && c.status !== "unsubscribed").length;
  const segments = useMemo(() => {
    const segs: { id: string; label: string; count: number }[] = [
      { id: "mailing_list", label: "Mailing list", count: mailingListCount },
    ];
    plans.filter(p => p.active).forEach(p => {
      const count = subscribers.filter(s => s.plan === p.name && s.status === "active").length;
      segs.push({ id: `plan_${p.id}`, label: p.name, count });
    });
    return segs;
  }, [plans, subscribers, contacts, mailingListCount]);

  const allSelected = segments.length > 0 && selectedSegments.length === segments.length;
  const toggleAll = () => {
    setSelectedSegments(allSelected ? [] : segments.map(s => s.id));
  };
  const toggleSegment = (id: string) => {
    setSelectedSegments(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const totalRecipients = segments
    .filter(s => selectedSegments.includes(s.id))
    .reduce((sum, s) => sum + s.count, 0);

  const canSend = subject.trim() && body.trim() && selectedSegments.length > 0;

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    try {
      // Map segment IDs back to labels for storage
      const targetLabels = segments.filter(s => selectedSegments.includes(s.id)).map(s => s.label);

      // Save broadcast
      const { data: broadcast, error } = await supabase
        .from("broadcasts")
        .insert({
          producer_id: producerId,
          subject: subject.trim(),
          body: body.trim(),
          target_segments: targetLabels as any,
          status: "sending",
        } as any)
        .select()
        .single();

      if (error || !broadcast) throw new Error(error?.message || "Failed to create broadcast");

      // Call edge function
      const { error: fnError } = await supabase.functions.invoke("send-broadcast", {
        body: { broadcast_id: (broadcast as any).id },
      });

      if (fnError) throw fnError;
      toast.success(`Broadcast sent successfully`);
      onSent();
    } catch (err: any) {
      toast.error(err.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  // Simple email preview
  const previewHtml = `
    <div style="max-width:560px;margin:0 auto;font-family:sans-serif;">
      ${settings.logoUrl ? `<div style="text-align:center;padding:16px 0;"><img src="${settings.logoUrl}" alt="" style="max-width:120px;max-height:60px;" /></div>` : ""}
      <div style="background:${settings.accentColor || "#1E293B"};padding:12px 20px;border-radius:8px 8px 0 0;">
        <span style="color:white;font-weight:700;font-size:16px;">${settings.businessName || "Your Business"}</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:0;padding:20px;border-radius:0 0 8px 8px;">
        <h2 style="margin:0 0 12px;font-size:18px;">${subject || "Subject line"}</h2>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />
        <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;color:#334155;">${body || "Your message will appear here…"}</div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <p style="font-size:11px;color:#94a3b8;margin:0;">You're receiving this because you're connected with ${settings.businessName || "this business"} on Slate.</p>
        <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;"><a href="#" style="color:#94a3b8;">Unsubscribe</a></p>
        <p style="font-size:10px;color:#cbd5e1;margin:8px 0 0;">Powered by Slate</p>
      </div>
    </div>
  `;

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-5 transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to broadcasts
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose form */}
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Subject line</label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Fresh lobster just landed!"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Message</label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={10}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Supports plain text. Line breaks will be preserved.</p>
          </div>

          <div>
            <label className="text-[13px] font-medium text-foreground mb-2 block">Who should receive this?</label>
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span className="text-[13px] font-medium">Select all</span>
              </label>
              <div className="border-t border-border my-1" />
              {segments.map(seg => (
                <label key={seg.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedSegments.includes(seg.id)}
                    onCheckedChange={() => toggleSegment(seg.id)}
                  />
                  <span className="text-[13px] flex-1">{seg.label}</span>
                  <span className="text-[11px] text-muted-foreground">{seg.count} contacts</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSend || sending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send Broadcast"}
            </Button>
            {totalRecipients > 0 && (
              <span className="text-[13px] text-muted-foreground">
                Will send to {totalRecipients} {totalRecipients === 1 ? "person" : "people"}
              </span>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="hidden lg:block">
          <label className="text-[13px] font-medium text-foreground mb-2 block">Email Preview</label>
          <div className="bg-white border border-border rounded-lg p-5 overflow-y-auto" style={{ maxHeight: 600 }}>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Send broadcast?"
        description={`This will send to ${totalRecipients} ${totalRecipients === 1 ? "person" : "people"} across ${selectedSegments.length} ${selectedSegments.length === 1 ? "segment" : "segments"}. Send now?`}
        confirmText="Send now"
        onConfirm={handleSend}
      />
    </div>
  );
}
