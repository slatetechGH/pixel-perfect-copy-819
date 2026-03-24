import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  producerId: string;
  onAdded: () => void;
}

export function AddContactModal({ open, onClose, producerId, onAdded }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("contacts").insert({
        producer_id: producerId,
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        phone: phone.trim() || null,
        source: "manual",
        status: "imported",
      } as any);
      if (error) {
        if (error.code === "23505") toast.error("This email already exists in your contacts");
        else throw error;
        return;
      }
      toast.success("Contact added");
      setEmail(""); setName(""); setPhone("");
      onAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-foreground">Add Contact</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1 block">Email *</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1 block">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1 block">Phone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Add Contact"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
