import { useState, useMemo } from "react";
import { Plus, Upload, Search, Send, Trash2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SlideOverPanel } from "@/components/SlideOverPanel";
import { ImportContactsModal } from "./ImportContactsModal";
import { AddContactModal } from "./AddContactModal";
import { ContactDetail } from "./ContactDetail";
import type { Contact } from "@/pages/Broadcasts";
import type { Plan } from "@/contexts/DashboardContext";
import { format } from "date-fns";

interface Props {
  contacts: Contact[];
  plans: Plan[];
  producerId: string;
  loading: boolean;
  onRefresh: () => void;
}

export function ContactsTab({ contacts, plans, producerId, loading, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inviteAllConfirm, setInviteAllConfirm] = useState(false);
  const [inviting, setInviting] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts;
    if (filter === "mailing_list") result = result.filter(c => !c.plan_id);
    else if (filter === "subscribers") result = result.filter(c => !!c.plan_id);
    else if (filter.startsWith("plan_")) {
      const planId = filter.replace("plan_", "");
      result = result.filter(c => c.plan_id === planId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        (c.name || "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [contacts, filter, search]);

  const uninvitedMailingCount = contacts.filter(c => !c.plan_id && c.status === "imported").length;

  const planName = (planId: string | null) => {
    if (!planId) return "No plan";
    return plans.find(p => p.id === planId)?.name || "Unknown";
  };

  const handleInvite = async (contactId: string) => {
    setInviting(true);
    try {
      const { error } = await supabase.functions.invoke("send-invite", {
        body: { contact_ids: [contactId] },
      });
      if (error) throw error;
      toast.success("Invite sent");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleInviteAll = async () => {
    setInviteAllConfirm(false);
    setInviting(true);
    try {
      const ids = contacts.filter(c => !c.plan_id && c.status === "imported").map(c => c.id);
      const { error } = await supabase.functions.invoke("send-invite", {
        body: { contact_ids: ids },
      });
      if (error) throw error;
      toast.success(`Invites sent to ${ids.length} contacts`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invites");
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    await supabase.from("contacts").delete().eq("id", contactId);
    toast.success("Contact removed");
    setSelectedContact(null);
    onRefresh();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      imported: "bg-muted text-muted-foreground",
      active: "bg-success/10 text-success",
      invited: "bg-primary/10 text-primary",
      unsubscribed: "bg-destructive/10 text-destructive",
    };
    return map[status] || map.imported;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="pl-9 w-[240px]"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10"
          >
            <option value="all">All contacts</option>
            <option value="mailing_list">Mailing list only</option>
            <option value="subscribers">Subscribers only</option>
            {plans.filter(p => p.active).map(p => (
              <option key={p.id} value={`plan_${p.id}`}>{p.name}</option>
            ))}
          </select>
          <span className="text-[13px] text-muted-foreground">{filtered.length} contacts</span>
        </div>
        <div className="flex items-center gap-2">
          {uninvitedMailingCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => setInviteAllConfirm(true)} disabled={inviting} className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Invite all ({uninvitedMailingCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add contact
          </Button>
          <Button size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import Contacts
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">No contacts found. Import a CSV or add contacts manually.</p>
          <Button onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Import Contacts
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Source</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(c)}
                  >
                    <td className="px-4 py-3 text-[14px] text-foreground">{c.name || "—"}</td>
                    <td className="px-4 py-3 text-[14px] text-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground capitalize">{c.source}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{planName(c.plan_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">
                      {format(new Date(c.created_at), "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      {!c.plan_id && c.status === "imported" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[12px] gap-1"
                          onClick={e => { e.stopPropagation(); handleInvite(c.id); }}
                          disabled={inviting}
                        >
                          <Send className="h-3 w-3" /> Invite
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ImportContactsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        producerId={producerId}
        onImported={onRefresh}
      />

      <AddContactModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        producerId={producerId}
        onAdded={onRefresh}
      />

      <SlideOverPanel
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title="Contact Details"
      >
        {selectedContact && (
          <ContactDetail
            contact={selectedContact}
            planName={planName(selectedContact.plan_id)}
            onInvite={() => handleInvite(selectedContact.id)}
            onDelete={() => handleDelete(selectedContact.id)}
            inviting={inviting}
          />
        )}
      </SlideOverPanel>

      <ConfirmDialog
        open={inviteAllConfirm}
        onClose={() => setInviteAllConfirm(false)}
        title="Invite all mailing list contacts?"
        description={`This will send invites to ${uninvitedMailingCount} contacts who haven't been invited yet.`}
        confirmText="Send invites"
        onConfirm={handleInviteAll}
      />
    </div>
  );
}
