import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus, Mail, Search, ChevronDown, ChevronUp, Trash2, Loader2,
  Calendar, MoreHorizontal, Download, ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  type: string;
  status: string;
  created_at: string;
  notes: string | null;
  last_contacted_at: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
  hear_about: string | null;
  message: string | null;
  newsletter: boolean | null;
  website: string | null;
  customer_count: string | null;
  interests: string[] | null;
  additional_notes: string | null;
  interested_plan: string | null;
  terms: boolean | null;
}

const STATUS_TABS = [
  { key: "new", label: "New" },
  { key: "reviewed", label: "Reviewed" },
  { key: "meeting_booked", label: "Meeting Booked" },
  { key: "follow_up", label: "Follow Up" },
  { key: "converted", label: "Converted" },
  { key: "ignored", label: "Ignored" },
  { key: "all", label: "All" },
] as const;

const STATUS_OPTIONS = STATUS_TABS.filter(t => t.key !== "all");

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-muted text-muted-foreground",
  meeting_booked: "bg-emerald-100 text-emerald-700",
  follow_up: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  ignored: "bg-gray-100 text-gray-400",
  contacted: "bg-muted text-muted-foreground",
};

const statusLabel = (s: string) => STATUS_OPTIONS.find(o => o.key === s)?.label || s;

type SortKey = "newest" | "oldest" | "alpha";

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load leads");
      console.error(error);
    }
    setLeads((data as Lead[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Filtering
  const filtered = leads
    .filter(l => activeTab === "all" || l.status === activeTab)
    .filter(l => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (l.name || "").toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.phone || "").toLowerCase().includes(s) ||
        (l.business_name || "").toLowerCase().includes(s) ||
        (l.notes || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "alpha") return (a.name || a.email).localeCompare(b.name || b.email);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const tabCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "all" ? leads.length : leads.filter(l => l.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  // Selection
  const allVisibleSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l.id)));
    }
  };
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Actions
  const updateStatus = async (id: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    const { error } = await supabase.from("leads").update({ status } as any).eq("id", id);
    if (error) toast.error("Failed to update"); else toast.success("Status updated");
  };

  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selected);
    setLeads(prev => prev.map(l => ids.includes(l.id) ? { ...l, status } : l));
    setSelected(new Set());
    for (const id of ids) {
      await supabase.from("leads").update({ status } as any).eq("id", id);
    }
    toast.success(`${ids.length} leads moved to ${statusLabel(status)}`);
  };

  const updateNotes = async (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    await supabase.from("leads").update({ notes } as any).eq("id", id);
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setExpandedId(null);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    await supabase.from("leads").delete().eq("id", id);
    toast.success("Lead deleted");
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    setSelected(new Set());
    setExpandedId(null);
    for (const id of ids) {
      await supabase.from("leads").delete().eq("id", id);
    }
    toast.success(`${ids.length} leads deleted`);
  };

  const exportCSV = () => {
    if (leads.length === 0) { toast.info("No leads to export"); return; }
    const headers = ["Name", "Email", "Phone", "Business", "Type", "Status", "Date", "Notes"];
    const rows = leads.map(l => [
      l.name || "", l.email, l.phone || "", l.business_name || "",
      l.type, l.status, l.created_at, l.notes || "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads-export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    const lead = leads.find(l => l.id === id);
    if (lead && lead.status === "new") {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "reviewed" } : l));
      await supabase.from("leads").update({ status: "reviewed" } as any).eq("id", id);
    }
    setExpandedId(id);
  };

  if (loading) {
    return (
      <DashboardLayout title="Leads & Enquiries" subtitle="Manage all incoming leads">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Leads & Enquiries"
      subtitle="Manage all incoming leads"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" />Export CSV
          </Button>
        </div>
      }
    >
      {/* Status tabs */}
      <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedId(null); setSelected(new Set()); }}
            className={`px-3 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-medium ${
                tab.key === "new" && tabCounts[tab.key] > 0 ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
              }`}>
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-0 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or notes..."
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-popover text-[16px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-1.5" />Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSort("newest")}>Newest first {sort === "newest" && "✓"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("oldest")}>Oldest first {sort === "oldest" && "✓"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("alpha")}>Alphabetical {sort === "alpha" && "✓"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted border border-border">
          <span className="text-[13px] font-medium text-foreground">{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Move to →</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.map(s => (
                <DropdownMenuItem key={s.key} onClick={() => bulkUpdateStatus(s.key)}>{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-1" />Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Lead list */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <UserPlus size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-[16px] font-medium text-muted-foreground mb-2">No leads found</p>
              <p className="text-[14px] text-muted-foreground">
                {search ? "Try a different search term" : "Leads from your marketing site will appear here"}
              </p>
            </div>
          ) : (
            <div>
              {/* Desktop header - hidden on mobile */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider items-center">
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </div>
                <div className="col-span-3">Name / Business</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1"></div>
              </div>

              {filtered.map(lead => (
                <div key={lead.id}>
                  {/* Mobile card layout */}
                  <div className="md:hidden p-4 border-b border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="pt-1" onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => toggleExpand(lead.id)}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[15px] font-medium text-foreground truncate">
                            {lead.business_name || lead.name || lead.email}
                          </p>
                          <span onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium cursor-pointer ${statusColors[lead.status] || statusColors.new}`}>
                                  {statusLabel(lead.status)}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {STATUS_OPTIONS.map(s => (
                                  <DropdownMenuItem key={s.key} onClick={() => updateStatus(lead.id, s.key)}>{s.label}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </span>
                        </div>
                        <p className="text-[14px] text-muted-foreground truncate">{lead.email}</p>
                        <p className="text-[13px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-border/50 hover:bg-muted/50 transition-colors items-center">
                    <div className="col-span-1 flex items-center" onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(lead.id)}
                        onCheckedChange={() => toggleSelect(lead.id)}
                      />
                    </div>
                    <div
                      className="col-span-3 cursor-pointer"
                      onClick={() => toggleExpand(lead.id)}
                    >
                      <p className="text-[14px] font-medium text-foreground truncate">
                        {lead.business_name || lead.name || lead.email}
                      </p>
                      {lead.name && lead.business_name && (
                        <p className="text-[12px] text-muted-foreground truncate">{lead.name}</p>
                      )}
                      {lead.notes && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 italic">
                          {lead.notes.substring(0, 60)}{lead.notes.length > 60 ? "…" : ""}
                        </p>
                      )}
                    </div>
                    <div className="col-span-3 text-[13px] text-muted-foreground truncate cursor-pointer" onClick={() => toggleExpand(lead.id)}>
                      {lead.email}
                      {lead.phone && <p className="text-[12px] text-muted-foreground/70">{lead.phone}</p>}
                    </div>
                    <div className="col-span-2 text-[12px] text-muted-foreground cursor-pointer" onClick={() => toggleExpand(lead.id)}>
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </div>
                    <div className="col-span-2" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium cursor-pointer ${statusColors[lead.status] || statusColors.new}`}>
                            {statusLabel(lead.status)}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {STATUS_OPTIONS.map(s => (
                            <DropdownMenuItem key={s.key} onClick={() => updateStatus(lead.id, s.key)}>{s.label}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="col-span-1 flex justify-end" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleExpand(lead.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/admin/meetings", { state: { bookForLead: lead } })}>
                            <Calendar className="h-4 w-4 mr-2" />Book Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${lead.email}`}>
                              <Mail className="h-4 w-4 mr-2" />Send Email
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(lead.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === lead.id && (
                    <div className="px-5 py-5 border-b border-border bg-muted/30">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                        {lead.name && <Field label="Name" value={lead.name} />}
                        <Field label="Email" value={lead.email} />
                        {lead.phone && <Field label="Phone" value={lead.phone} />}
                        {lead.business_name && <Field label="Business" value={lead.business_name} />}
                        {lead.business_type && <Field label="Business Type" value={lead.business_type} />}
                        {lead.hear_about && <Field label="How they heard" value={lead.hear_about} />}
                        {lead.website && <Field label="Website" value={lead.website} />}
                        {lead.customer_count && <Field label="Customers" value={lead.customer_count} />}
                        {lead.interested_plan && <Field label="Interested Plan" value={lead.interested_plan} />}
                        <Field label="Type" value={lead.type} />
                        <Field label="Submitted" value={new Date(lead.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
                        {lead.last_contacted_at && <Field label="Last Contacted" value={formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })} />}
                      </div>
                      {lead.interests && lead.interests.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[12px] text-muted-foreground block mb-1">Interests</span>
                          <div className="flex flex-wrap gap-1.5">
                            {lead.interests.map((i, idx) => (
                              <span key={idx} className="text-[12px] px-2 py-0.5 rounded-md bg-muted text-foreground">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.message && (
                        <div className="mb-4">
                          <span className="text-[12px] text-muted-foreground block mb-1">Message</span>
                          <p className="text-[13px] text-foreground whitespace-pre-wrap bg-background rounded-lg p-3 border border-border">{lead.message}</p>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="mb-4">
                        <label className="text-[12px] font-medium text-muted-foreground block mb-1">Internal Notes</label>
                        <textarea
                          value={lead.notes || ""}
                          onBlur={e => updateNotes(lead.id, e.target.value)}
                          onChange={e => setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: e.target.value } : l))}
                          rows={2}
                          placeholder="Add notes about this lead..."
                          className="w-full px-3 py-2 rounded-lg border border-input bg-popover text-[13px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => navigate("/admin/meetings", { state: { bookForLead: lead } })}>
                          <Calendar className="h-4 w-4 mr-1.5" />Book Meeting
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${lead.email}`}>
                            <Mail className="h-4 w-4 mr-1.5" />Send Email
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(lead.id)}>
                          <Trash2 className="h-4 w-4 mr-1.5" />Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deleteLead(deleteConfirm)}
        title="Delete lead"
        description="This will permanently remove this lead from your records."
        confirmText="Delete"
        destructive
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={bulkDelete}
        title="Delete selected leads"
        description={`Delete ${selected.size} leads? This cannot be undone.`}
        confirmText="Delete All"
        destructive
      />
    </DashboardLayout>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-[12px] text-muted-foreground block">{label}</span>
    <span className="text-[14px] text-foreground capitalize">{value}</span>
  </div>
);

export default Leads;
