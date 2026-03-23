import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Search, ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  type: "signup" | "contact" | "newsletter";
  status: "new" | "reviewed" | "contacted";
  created_at: string;
  notes: string | null;
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

const tabs = ["Signup Requests", "Contact Enquiries", "Newsletter Signups"] as const;
const tabTypeMap: Record<string, Lead["type"]> = {
  "Signup Requests": "signup",
  "Contact Enquiries": "contact",
  "Newsletter Signups": "newsletter",
};

const statusBadge: Record<string, string> = {
  new: "bg-amber/10 text-amber",
  reviewed: "bg-secondary text-muted-foreground",
  contacted: "bg-success/10 text-success",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Signup Requests");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data && !error) {
      setLeads(data as Lead[]);
    } else if (error) {
      console.error("Failed to fetch leads:", error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const type = tabTypeMap[activeTab];
  const filtered = leads
    .filter(l => l.type === type)
    .filter(l => {
      const s = search.toLowerCase();
      return (l.name || "").toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || (l.business_name || "").toLowerCase().includes(s);
    });

  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === "new").length;

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    const lead = leads.find(l => l.id === id);
    if (lead && lead.status === "new") {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "reviewed" as const } : l));
      await supabase.from("leads").update({ status: "reviewed" }).eq("id", id);
    }
    setExpandedId(id);
  };

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else toast.success("Status updated");
  };

  const updateNotes = async (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    await supabase.from("leads").update({ notes }).eq("id", id);
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setExpandedId(null);
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error("Failed to delete lead");
    else toast.success("Lead deleted");
  };

  if (loading) {
    return (
      <DashboardLayout title="Leads & Enquiries" subtitle="All marketing website submissions">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Leads & Enquiries"
      subtitle="All marketing website submissions"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">{totalCount} total · {newCount} new</span>
          <Button variant="outline" size="sm" onClick={() => toast("Export coming soon")}>Export CSV</Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {tabs.map(tab => {
          const tabType = tabTypeMap[tab];
          const tabCount = leads.filter(l => l.type === tabType).length;
          const tabNewCount = leads.filter(l => l.type === tabType && l.status === "new").length;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedId(null); }}
              className={`px-4 py-2.5 text-[14px] font-medium transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === tab ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab}
              <span className="text-[12px] text-muted-foreground">({tabCount})</span>
              {tabNewCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber text-white text-[11px] font-medium flex items-center justify-center">{tabNewCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or business..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
        />
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <UserPlus size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-[16px] font-medium text-muted-foreground mb-2">No {activeTab.toLowerCase()} yet</p>
              <p className="text-[14px] text-muted-foreground">Leads from your marketing site will appear here</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-caption font-medium text-muted-foreground uppercase tracking-[0.05em]">
                <div className="col-span-3">{type === "newsletter" ? "Email" : "Name"}</div>
                <div className="col-span-3">Email</div>
                {type !== "newsletter" && <div className="col-span-2">Business</div>}
                <div className={type === "newsletter" ? "col-span-3" : "col-span-2"}>Date</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1"></div>
              </div>

              {filtered.map(lead => (
                <div key={lead.id}>
                  <button
                    onClick={() => toggleExpand(lead.id)}
                    className="w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-border hover:bg-background/60 transition-colors cursor-pointer text-left items-center"
                  >
                    <div className="col-span-3 text-[14px] font-medium text-foreground truncate">{lead.name || lead.email}</div>
                    <div className="col-span-3 text-[13px] text-muted-foreground truncate">{lead.email}</div>
                    {type !== "newsletter" && <div className="col-span-2 text-[13px] text-muted-foreground truncate">{lead.business_name || "—"}</div>}
                    <div className={`${type === "newsletter" ? "col-span-3" : "col-span-2"} text-[13px] text-muted-foreground`}>{formatDate(lead.created_at)}</div>
                    <div className="col-span-1">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${statusBadge[lead.status]}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {expandedId === lead.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expandedId === lead.id && (
                    <div className="px-5 py-5 border-b border-border bg-secondary/50">
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        {lead.name && <div><span className="text-[12px] text-muted-foreground block">Name</span><span className="text-[14px] text-foreground">{lead.name}</span></div>}
                        <div><span className="text-[12px] text-muted-foreground block">Email</span><span className="text-[14px] text-foreground">{lead.email}</span></div>
                        {lead.phone && <div><span className="text-[12px] text-muted-foreground block">Phone</span><span className="text-[14px] text-foreground">{lead.phone}</span></div>}
                        {lead.business_name && <div><span className="text-[12px] text-muted-foreground block">Business</span><span className="text-[14px] text-foreground">{lead.business_name}</span></div>}
                        {lead.business_type && <div><span className="text-[12px] text-muted-foreground block">Business Type</span><span className="text-[14px] text-foreground">{lead.business_type}</span></div>}
                        {lead.hear_about && <div><span className="text-[12px] text-muted-foreground block">How they heard</span><span className="text-[14px] text-foreground">{lead.hear_about}</span></div>}
                        {lead.website && <div><span className="text-[12px] text-muted-foreground block">Website</span><span className="text-[14px] text-foreground">{lead.website}</span></div>}
                        {lead.customer_count && <div><span className="text-[12px] text-muted-foreground block">Customers</span><span className="text-[14px] text-foreground">{lead.customer_count}</span></div>}
                        {lead.interested_plan && <div><span className="text-[12px] text-muted-foreground block">Interested Plan</span><span className="text-[14px] text-foreground capitalize">{lead.interested_plan}</span></div>}
                        {lead.interests && lead.interests.length > 0 && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Interests</span><span className="text-[14px] text-foreground">{lead.interests.join(", ")}</span></div>
                        )}
                        {lead.message && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Message</span><p className="text-[14px] text-foreground whitespace-pre-wrap">{lead.message}</p></div>
                        )}
                        {lead.additional_notes && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Additional Notes</span><p className="text-[14px] text-foreground">{lead.additional_notes}</p></div>
                        )}
                        <div><span className="text-[12px] text-muted-foreground block">Submitted</span><span className="text-[14px] text-foreground">{formatDate(lead.created_at)}</span></div>
                      </div>

                      {/* Status dropdown */}
                      <div className="mb-4">
                        <label className="text-[12px] font-medium text-muted-foreground block mb-1">Status</label>
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value as Lead["status"])}
                          className="h-9 px-3 rounded-lg border border-border bg-white text-[13px] appearance-none pr-8 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <label className="text-[12px] font-medium text-muted-foreground block mb-1">Internal Notes</label>
                        <textarea
                          value={lead.notes || ""}
                          onBlur={e => updateNotes(lead.id, e.target.value)}
                          onChange={e => setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: e.target.value } : l))}
                          rows={2}
                          placeholder="Add notes about this lead..."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[13px] font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          <Mail size={14} /> Send email
                        </a>
                        <button
                          onClick={() => setDeleteConfirm(lead.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
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
    </DashboardLayout>
  );
};

export default Leads;
