import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Search, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useApp, Lead } from "@/contexts/AppContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

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
  const { leads, setLeads } = useApp();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Signup Requests");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const type = tabTypeMap[activeTab];
  const filtered = leads
    .filter(l => l.type === type)
    .filter(l => {
      const s = search.toLowerCase();
      return (l.name || "").toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || (l.businessName || "").toLowerCase().includes(s);
    });

  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === "new").length;

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    // Auto-mark as reviewed
    setLeads(prev => prev.map(l => l.id === id && l.status === "new" ? { ...l, status: "reviewed" } : l));
    setExpandedId(id);
  };

  const updateStatus = (id: string, status: Lead["status"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success("Status updated");
  };

  const updateNotes = (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setExpandedId(null);
    toast.success("Lead deleted");
  };

  return (
    <DashboardLayout
      title="Leads & Enquiries"
      subtitle="All marketing website submissions"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">{totalCount} total</span>
          <Button variant="outline" size="sm" onClick={() => toast("Export coming soon")}>Export CSV</Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {tabs.map(tab => {
          const tabType = tabTypeMap[tab];
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
              <p className="text-[16px] font-medium text-muted-foreground mb-2">No enquiries yet</p>
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
                    {type !== "newsletter" && <div className="col-span-2 text-[13px] text-muted-foreground truncate">{lead.businessName || "—"}</div>}
                    <div className={`${type === "newsletter" ? "col-span-3" : "col-span-2"} text-[13px] text-muted-foreground`}>{formatDate(lead.timestamp)}</div>
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
                        {lead.businessName && <div><span className="text-[12px] text-muted-foreground block">Business</span><span className="text-[14px] text-foreground">{lead.businessName}</span></div>}
                        {lead.businessType && <div><span className="text-[12px] text-muted-foreground block">Business Type</span><span className="text-[14px] text-foreground">{lead.businessType}</span></div>}
                        {lead.hearAbout && <div><span className="text-[12px] text-muted-foreground block">How they heard</span><span className="text-[14px] text-foreground">{lead.hearAbout}</span></div>}
                        {lead.website && <div><span className="text-[12px] text-muted-foreground block">Website</span><span className="text-[14px] text-foreground">{lead.website}</span></div>}
                        {lead.customerCount && <div><span className="text-[12px] text-muted-foreground block">Customers</span><span className="text-[14px] text-foreground">{lead.customerCount}</span></div>}
                        {lead.interestedPlan && <div><span className="text-[12px] text-muted-foreground block">Interested Plan</span><span className="text-[14px] text-foreground capitalize">{lead.interestedPlan}</span></div>}
                        {lead.interests && lead.interests.length > 0 && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Interests</span><span className="text-[14px] text-foreground">{lead.interests.join(", ")}</span></div>
                        )}
                        {lead.message && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Message</span><p className="text-[14px] text-foreground whitespace-pre-wrap">{lead.message}</p></div>
                        )}
                        {lead.additionalNotes && (
                          <div className="col-span-2"><span className="text-[12px] text-muted-foreground block">Additional Notes</span><p className="text-[14px] text-foreground">{lead.additionalNotes}</p></div>
                        )}
                        <div><span className="text-[12px] text-muted-foreground block">Submitted</span><span className="text-[14px] text-foreground">{formatDate(lead.timestamp)}</span></div>
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
                          value={lead.notes}
                          onChange={e => updateNotes(lead.id, e.target.value)}
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
