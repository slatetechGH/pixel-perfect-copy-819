import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Search, ExternalLink, Copy, Wand2, Users, CreditCard, FileText, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SlideOverPanel } from "@/components/SlideOverPanel";

interface ProducerDetail {
  id: string;
  email: string;
  business_name: string | null;
  business_type: string | null;
  url_slug: string | null;
  logo_url: string | null;
  accent_color: string | null;
  stripe_connect_status: string;
  commission_percentage: number;
  subscription_tier: string;
  created_at: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  planCount: number;
  contentCount: number;
  dropCount: number;
  subscriberCount: number;
  collectionsThisMonth: number;
}

const AdminProducers = () => {
  const [producers, setProducers] = useState<ProducerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProducerDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducers = async () => {
      setLoading(true);

      // Get all profiles that have the 'producer' role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "producer");

      const producerIds = (roles || []).map((r: any) => r.user_id);
      if (producerIds.length === 0) {
        setProducers([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const [profilesRes, plansRes, contentRes, dropsRes, subsRes, collectionsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", producerIds),
        supabase.from("plans").select("id, producer_id").in("producer_id", producerIds),
        supabase.from("content").select("id, producer_id").in("producer_id", producerIds),
        supabase.from("drops").select("id, producer_id").in("producer_id", producerIds),
        supabase.from("subscribers").select("id, producer_id, status").in("producer_id", producerIds),
        supabase.from("collections").select("id, producer_id").in("producer_id", producerIds).eq("month_year", currentMonthYear),
      ]);

      const plans = plansRes.data || [];
      const content = contentRes.data || [];
      const drops = dropsRes.data || [];
      const subs = subsRes.data || [];
      const colls = collectionsRes.data || [];

      const countBy = (arr: any[], field: string, id: string) =>
        arr.filter((r) => r[field] === id).length;
      const activeSubsBy = (id: string) =>
        subs.filter((s: any) => s.producer_id === id && s.status === "active").length;

      const mapped: ProducerDetail[] = (profilesRes.data || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        business_name: p.business_name,
        business_type: p.business_type,
        url_slug: p.url_slug,
        logo_url: p.logo_url,
        accent_color: p.accent_color,
        stripe_connect_status: p.stripe_connect_status,
        commission_percentage: p.commission_percentage,
        subscription_tier: p.subscription_tier || "free",
        created_at: p.created_at,
        description: p.description,
        phone: p.phone,
        website: p.website,
        instagram: p.instagram,
        planCount: countBy(plans, "producer_id", p.id),
        contentCount: countBy(content, "producer_id", p.id),
        dropCount: countBy(drops, "producer_id", p.id),
        subscriberCount: activeSubsBy(p.id),
        collectionsThisMonth: countBy(colls, "producer_id", p.id),
      }));

      setProducers(mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setLoading(false);
    };

    fetchProducers();
  }, []);

  const filtered = producers.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.business_name || "").toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.url_slug || "").toLowerCase().includes(q)
    );
  });

  const isConfigured = (p: ProducerDetail) =>
    !!(p.business_name && p.planCount > 0);

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${slug}`);
    toast.success("Storefront URL copied!");
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  };

  return (
    <DashboardLayout
      title="Producers"
      subtitle="All registered producers on the platform"
    >
      {/* Search */}
      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground font-medium">Total Producers</p>
          <p className="text-[22px] font-semibold text-foreground">{producers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground font-medium">Configured</p>
          <p className="text-[22px] font-semibold text-foreground">
            {producers.filter(isConfigured).length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground font-medium">Total Subscribers</p>
          <p className="text-[22px] font-semibold text-foreground">
            {producers.reduce((s, p) => s + p.subscriberCount, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground font-medium">Stripe Active</p>
          <p className="text-[22px] font-semibold text-foreground">
            {producers.filter((p) => p.stripe_connect_status === "active").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 px-7 pt-7">
          <CardTitle className="text-[15px] font-medium text-foreground">
            All Producers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[14px] text-muted-foreground py-8 text-center">
              {search ? "No producers match your search." : "No producers registered yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Business</th>
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Email</th>
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Signed Up</th>
                    <th className="text-center text-[12px] font-medium text-muted-foreground py-3 pr-4">Plans</th>
                    <th className="text-center text-[12px] font-medium text-muted-foreground py-3 pr-4">Subs</th>
                    <th className="text-center text-[12px] font-medium text-muted-foreground py-3 pr-4">Collections</th>
                    <th className="text-left text-[12px] font-medium text-muted-foreground py-3 pr-4">Status</th>
                    <th className="text-right text-[12px] font-medium text-muted-foreground py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          {p.logo_url ? (
                            <img src={p.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                              style={{ backgroundColor: p.accent_color || "hsl(var(--muted-foreground))" }}
                            >
                              {(p.business_name || p.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-[14px] font-medium text-foreground">
                            {p.business_name || "Not set up"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[14px] text-muted-foreground">{p.email}</td>
                      <td className="py-3 pr-4 text-[13px] text-muted-foreground">{formatDate(p.created_at)}</td>
                      <td className="py-3 pr-4 text-center text-[14px] text-foreground">{p.planCount}</td>
                      <td className="py-3 pr-4 text-center text-[14px] text-foreground">{p.subscriberCount}</td>
                      <td className="py-3 pr-4 text-center text-[14px] text-foreground">{p.collectionsThisMonth}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={isConfigured(p) ? "default" : "secondary"}
                          className={`text-[11px] ${isConfigured(p) ? "bg-success/10 text-success border-0" : ""}`}
                        >
                          {isConfigured(p) ? "Configured" : "Not configured"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {p.url_slug && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(`/store/${p.url_slug}`, "_blank")}
                                title="View storefront"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyUrl(p.url_slug!)}
                                title="Copy URL"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate("/demo-setup")}
                            title="Configure in Demo Launcher"
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Producer Detail Panel */}
      <SlideOverPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.business_name || "Producer Details"}
      >
        {selected && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              {selected.logo_url ? (
                <img src={selected.logo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white text-[20px] font-bold"
                  style={{ backgroundColor: selected.accent_color || "hsl(var(--muted-foreground))" }}
                >
                  {(selected.business_name || selected.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">{selected.business_name || "Not set up"}</h3>
                <p className="text-[13px] text-muted-foreground">{selected.email}</p>
                {selected.business_type && (
                  <p className="text-[12px] text-muted-foreground">{selected.business_type}</p>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3 flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Plans</p>
                  <p className="text-[16px] font-semibold text-foreground">{selected.planCount}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Subscribers</p>
                  <p className="text-[16px] font-semibold text-foreground">{selected.subscriberCount}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Content</p>
                  <p className="text-[16px] font-semibold text-foreground">{selected.contentCount}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 flex items-center gap-3">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Drops</p>
                  <p className="text-[16px] font-semibold text-foreground">{selected.dropCount}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Signed Up</span>
                <span className="text-foreground font-medium">{formatDate(selected.created_at)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Commission</span>
                <span className="text-foreground font-medium">{selected.commission_percentage}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Stripe</span>
                <Badge
                  variant={selected.stripe_connect_status === "active" ? "default" : "secondary"}
                  className={`text-[11px] ${selected.stripe_connect_status === "active" ? "bg-success/10 text-success border-0" : ""}`}
                >
                  {selected.stripe_connect_status}
                </Badge>
              </div>
              {selected.description && (
                <div className="py-2 border-b border-border/50">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selected.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              {selected.url_slug && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`/store/${selected.url_slug}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Storefront
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelected(null);
                  navigate("/demo-setup");
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Configure in Demo Launcher
              </Button>
            </div>
          </div>
        )}
      </SlideOverPanel>
    </DashboardLayout>
  );
};

export default AdminProducers;
