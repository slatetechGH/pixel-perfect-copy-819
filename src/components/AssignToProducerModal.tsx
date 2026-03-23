import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X, Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { DemoPlan, DemoDrop, DemoContent } from "@/contexts/AppContext";

interface Producer {
  id: string;
  email: string;
  business_name: string | null;
  created_at: string;
}

interface AssignToProducerModalProps {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  tagline: string;
  accentColor: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string;
  plans: DemoPlan[];
  drops: DemoDrop[];
  content: DemoContent[];
}

async function uploadBlobToStorage(
  blobUrl: string,
  bucket: string,
  producerId: string,
  label: string,
): Promise<string | null> {
  if (!blobUrl || !blobUrl.startsWith("blob:")) return blobUrl;
  try {
    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const path = `${producerId}_${Date.now()}_${label}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: true });
    if (error) { console.error(`Upload to ${bucket} failed:`, error); return null; }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`Upload failed:`, err);
    return null;
  }
}

export function AssignToProducerModal({
  open, onClose, businessName, businessType, tagline, accentColor,
  logoUrl, coverUrl, description, plans, drops, content,
}: AssignToProducerModalProps) {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ email: string; slug: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSearch("");
    setSelectedId(null);
    setSuccess(null);

    (async () => {
      const { data, error } = await supabase.rpc("get_all_producers");
      if (error) {
        console.error("Failed to fetch producers:", error);
        setLoading(false);
        return;
      }
      setProducers((data || []) as Producer[]);
      setLoading(false);
    })();
  }, [open]);

  const filtered = producers.filter(p => {
    const s = search.toLowerCase();
    return (p.business_name || "").toLowerCase().includes(s) || p.email.toLowerCase().includes(s);
  });

  const handleAssign = async () => {
    if (!selectedId) return;
    const producer = producers.find(p => p.id === selectedId);
    if (!producer) return;

    setAssigning(true);
    const pid = selectedId;
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      // 1. Upload images if they are blob URLs
      const [finalLogo, finalCover] = await Promise.all([
        uploadBlobToStorage(logoUrl || "", "logos", pid, "logo"),
        uploadBlobToStorage(coverUrl || "", "covers", pid, "cover"),
      ]);

      // 2. Update producer profile
      const { error: profErr } = await supabase.from("profiles").update({
        business_name: businessName,
        business_type: businessType,
        tagline,
        description: description || tagline,
        accent_color: accentColor,
        logo_url: finalLogo,
        cover_url: finalCover,
        url_slug: slug,
      }).eq("id", pid);

      if (profErr) throw new Error(`Profile update failed: ${profErr.message}`);

      // 3. Delete existing plans/content/drops for this producer (clean slate)
      await Promise.all([
        supabase.from("plans").delete().eq("producer_id", pid),
        supabase.from("content").delete().eq("producer_id", pid),
        supabase.from("drops").delete().eq("producer_id", pid),
      ]);

      // 4. Insert plans
      const validPlans = plans.filter(p => p.name);
      if (validPlans.length > 0) {
        const planRows = validPlans.map((p, i) => ({
          producer_id: pid,
          name: p.name,
          price_num: p.price,
          is_free: p.isFree,
          benefits: p.features,
          description: "",
          active: true,
          show_on_public_page: true,
          sort_order: i,
        }));
        const { error: planErr } = await supabase.from("plans").insert(planRows);
        if (planErr) console.error("Plans insert error:", planErr);
      }

      // 5. Insert content
      const validContent = content.filter(c => c.title);
      if (validContent.length > 0) {
        const contentRows = validContent.map(c => ({
          producer_id: pid,
          title: c.title,
          type: c.type,
          status: c.status === "published" ? "published" : "draft",
          body: "",
          prep_time: c.prepTime || null,
          cook_time: c.cookTime || null,
          serves: c.serves || null,
        }));
        const { error: contErr } = await supabase.from("content").insert(contentRows);
        if (contErr) console.error("Content insert error:", contErr);
      }

      // 6. Insert drops
      const validDrops = drops.filter(d => d.name);
      if (validDrops.length > 0) {
        const dropRows = validDrops.map(d => ({
          producer_id: pid,
          title: d.name,
          description: "",
          status: d.status,
          total: d.quantity,
          remaining: d.quantity - d.sold,
          price_num: d.price,
        }));
        const { error: dropErr } = await supabase.from("drops").insert(dropRows);
        if (dropErr) console.error("Drops insert error:", dropErr);
      }

      setSuccess({ email: producer.email, slug });
      toast.success(`${businessName} has been assigned to ${producer.email}`);
    } catch (err: any) {
      toast.error(err.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[18px] font-bold text-foreground">
            {success ? "Assignment Complete" : "Assign to Producer"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-success" />
            </div>
            <p className="text-[16px] font-medium text-foreground mb-2">
              <strong>{businessName}</strong> has been assigned to <strong>{success.email}</strong>
            </p>
            <p className="text-[14px] text-muted-foreground mb-5">
              They can now log in and see their fully set up dashboard.
            </p>
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="text-left min-w-0">
                <p className="text-[12px] text-muted-foreground mb-0.5">Storefront URL</p>
                <p className="text-[14px] font-medium text-foreground truncate">/store/{success.slug}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/store/${success.slug}`);
                    toast.success("URL copied");
                  }}
                >
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/store/${success.slug}`, "_blank")}
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
            </div>
            <Button variant="slate" className="mt-6" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-6 pt-4 pb-2">
              <p className="text-[14px] text-muted-foreground mb-3">
                Select a registered producer to assign <strong>{businessName}</strong>'s setup to.
                This will overwrite their existing plans, content, and drops.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto px-6 pb-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-[14px] text-muted-foreground py-8 text-center">
                  {producers.length === 0 ? "No producers registered yet." : "No matching producers."}
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all cursor-pointer ${
                        selectedId === p.id
                          ? "bg-foreground/5 border border-foreground"
                          : "hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-foreground truncate">
                          {p.business_name || "No business name"}
                        </p>
                        <p className="text-[13px] text-muted-foreground truncate">{p.email}</p>
                      </div>
                      <span className="text-[12px] text-muted-foreground shrink-0 ml-3">
                        {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                variant="slate"
                disabled={!selectedId || assigning}
                onClick={handleAssign}
              >
                {assigning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Assigning...</> : "Assign Setup"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
