import { Send, Trash2, Mail, User, Phone, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/pages/Broadcasts";
import { format } from "date-fns";

interface Props {
  contact: Contact;
  planName: string;
  onInvite: () => void;
  onDelete: () => void;
  inviting: boolean;
}

export function ContactDetail({ contact, planName, onInvite, onDelete, inviting }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[14px]">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{contact.name || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{contact.email}</span>
        </div>
        {contact.phone && (
          <div className="flex items-center gap-2 text-[14px]">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{contact.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[14px]">
          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{planName}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">Added {format(new Date(contact.created_at), "d MMM yyyy")}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Activity</p>
        <div className="space-y-2 text-[13px] text-muted-foreground">
          <p>Imported on {format(new Date(contact.created_at), "d MMM yyyy")}</p>
          {contact.invited_at && <p>Invited on {format(new Date(contact.invited_at), "d MMM yyyy")}</p>}
          {contact.subscribed_at && <p>Subscribed on {format(new Date(contact.subscribed_at), "d MMM yyyy")}</p>}
          {contact.unsubscribed_at && <p>Unsubscribed on {format(new Date(contact.unsubscribed_at), "d MMM yyyy")}</p>}
        </div>
      </div>

      <div className="border-t border-border pt-4 flex flex-col gap-2">
        {!contact.plan_id && contact.status !== "invited" && (
          <Button variant="outline" className="gap-2" onClick={onInvite} disabled={inviting}>
            <Send className="h-4 w-4" /> Send invite
          </Button>
        )}
        <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Remove contact
        </Button>
      </div>
    </div>
  );
}
