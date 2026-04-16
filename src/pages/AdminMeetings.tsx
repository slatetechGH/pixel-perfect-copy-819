import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar, Plus, Check, Loader2, Trash2, ExternalLink,
  Video, Phone, MapPin, MoreHorizontal, Clock, TrendingUp, Copy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDistanceToNow, format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  date: string;
  notes: string | null;
  completed: boolean;
  producer_id: string | null;
  lead_id: string | null;
  duration_minutes: number | null;
  meeting_link: string | null;
  status: string | null;
  created_at: string;
}

const MEETING_TYPES = [
  { value: "video_call", label: "Video Call", icon: Video },
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "in_person", label: "In Person", icon: MapPin },
];

const DURATIONS = [15, 30, 45, 60];

const STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-muted text-muted-foreground" },
  { value: "no_show", label: "No Show", color: "bg-red-100 text-red-700" },
];

const generateMeetingLink = (type: string, leadName: string) => {
  if (type === "video_call") {
    const sanitized = leadName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "meeting";
    const random = Math.random().toString(36).slice(2, 8);
    return `https://meet.jit.si/slate-${sanitized}-${random}`;
  }
  return null;
};

const typeInfo = (val: string) => MEETING_TYPES.find(t => t.value === val) || MEETING_TYPES[MEETING_TYPES.length - 1];
const statusInfo = (val: string) => STATUSES.find(s => s.value === val) || STATUSES[0];

const AdminMeetings = () => {
  const { session } = useApp();
  const location = useLocation();
  const bookForLead = (location.state as any)?.bookForLead || null;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(!!bookForLead);

  // Form
  const [formName, setFormName] = useState(bookForLead?.name || bookForLead?.business_name || "");
  const [formEmail, setFormEmail] = useState(bookForLead?.email || "");
  const [formLeadId, setFormLeadId] = useState(bookForLead?.id || "");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("10:00");
  const [formDuration, setFormDuration] = useState(30);
  const [formType, setFormType] = useState("video_call");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    const { data } = await supabase
      .from("admin_meetings")
      .select("*")
      .order("date", { ascending: true });
    setMeetings((data || []) as Meeting[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const now = new Date();
  const upcoming = meetings.filter(m => {
    const s = m.status || (m.completed ? "completed" : "scheduled");
    return s === "scheduled" && new Date(m.date) >= now;
  });
  const overdue = meetings.filter(m => {
    const s = m.status || (m.completed ? "completed" : "scheduled");
    return s === "scheduled" && new Date(m.date) < now;
  });
  const past = meetings.filter(m => {
    const s = m.status || (m.completed ? "completed" : "scheduled");
    return s !== "scheduled";
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Stats
  const thisMonth = meetings.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisWeek = meetings.filter(m => {
    const d = new Date(m.date);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo && d <= now;
  });

  const resetForm = () => {
    setFormName(""); setFormEmail(""); setFormLeadId(""); setFormDate("");
    setFormTime("10:00"); setFormDuration(30); setFormType("video_call");
    setFormNotes(""); setCalendarLink(null);
  };

  const handleBookMeeting = async () => {
    if (!formName.trim() || !formEmail.trim() || !formDate) {
      toast.error("Name, email and date are required");
      return;
    }
    setSaving(true);

    const dateTime = new Date(`${formDate}T${formTime}`);
    const title = `Slate Demo – ${formName.trim()}`;
    const meetingLink = generateMeetingLink(formType, formName);

    const insertData: any = {
      admin_id: session.supabaseUser!.id,
      title,
      meeting_type: formType,
      date: dateTime.toISOString(),
      notes: formNotes.trim() || null,
      duration_minutes: formDuration,
      meeting_link: meetingLink,
      status: "scheduled",
    };
    if (formLeadId) insertData.lead_id = formLeadId;

    const { error } = await supabase.from("admin_meetings").insert(insertData);
    if (error) {
      toast.error("Failed to create meeting");
      setSaving(false);
      return;
    }

    // Update lead status if linked
    if (formLeadId) {
      await supabase.from("leads").update({
        status: "meeting_booked",
        last_contacted_at: new Date().toISOString(),
      } as any).eq("id", formLeadId);
    }

    // Send confirmation email to the lead
    try {
      const { error: emailError } = await supabase.functions.invoke("send-meeting-confirmation", {
        body: {
          to_email: formEmail.trim(),
          to_name: formName.trim(),
          meeting_date: dateTime.toISOString(),
          duration_minutes: formDuration,
          meeting_type: formType,
          meeting_link: meetingLink,
          notes: formNotes.trim() || null,
        },
      });
      if (emailError) {
        console.error("Email send error:", emailError);
        toast.success(`Meeting booked with ${formName} — but confirmation email failed to send`);
      } else {
        toast.success(`Meeting booked with ${formName} — confirmation email sent`);
      }
    } catch (e) {
      console.error("Email send exception:", e);
      toast.success(`Meeting booked with ${formName} — but confirmation email failed to send`);
    }

    setCalendarLink(meetingLink);
    setSaving(false);
    fetchMeetings();
  };

  const updateMeetingStatus = async (id: string, status: string) => {
    const completed = status === "completed";
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status, completed } : m));
    await supabase.from("admin_meetings").update({ status, completed } as any).eq("id", id);
    toast.success(`Meeting marked as ${statusInfo(status).label}`);
  };

  const deleteMeeting = async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    await supabase.from("admin_meetings").delete().eq("id", id);
    toast.success("Meeting deleted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <DashboardLayout title="Meetings & Follow-ups" subtitle="Track your meetings">
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Meetings & Follow-ups"
      subtitle="Track your meetings and tasks"
      actions={
        <Button size="sm" onClick={() => { resetForm(); setShowBooking(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Book Meeting
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border p-4 bg-blue-50">
          <p className="text-[12px] text-muted-foreground font-medium">This Month</p>
          <p className="text-[22px] font-semibold text-foreground">{thisMonth.length}</p>
        </div>
        <div className="rounded-xl border border-border p-4 bg-emerald-50">
          <p className="text-[12px] text-muted-foreground font-medium">This Week</p>
          <p className="text-[22px] font-semibold text-foreground">{thisWeek.length}</p>
        </div>
        <div className="rounded-xl border border-border p-4 bg-amber-50">
          <p className="text-[12px] text-muted-foreground font-medium flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Upcoming</p>
          <p className="text-[22px] font-semibold text-foreground">{upcoming.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {(["upcoming", "past"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[14px] font-medium transition-colors cursor-pointer border-b-2 capitalize ${
              activeTab === tab ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab === "upcoming" ? `Upcoming (${upcoming.length + overdue.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" ? (
        <div className="space-y-3">
          {overdue.length > 0 && (
            <>
              <p className="text-[12px] font-semibold text-amber-600 uppercase tracking-wider">Overdue</p>
              {overdue.map(m => <MeetingCard key={m.id} m={m} onStatusChange={updateMeetingStatus} onDelete={id => setDeleteId(id)} overdue />)}
            </>
          )}
          {upcoming.length > 0 && (
            <>
              {overdue.length > 0 && <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mt-4">Upcoming</p>}
              {upcoming.map(m => <MeetingCard key={m.id} m={m} onStatusChange={updateMeetingStatus} onDelete={id => setDeleteId(id)} />)}
            </>
          )}
          {overdue.length === 0 && upcoming.length === 0 && (
            <Card className="border-0 shadow-card">
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No upcoming meetings</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {past.length === 0 ? (
            <Card className="border-0 shadow-card">
              <CardContent className="py-12 text-center">
                <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No past meetings yet</p>
              </CardContent>
            </Card>
          ) : (
            past.map(m => <MeetingCard key={m.id} m={m} onStatusChange={updateMeetingStatus} onDelete={id => setDeleteId(id)} />)
          )}
        </div>
      )}

      {/* Book Meeting Dialog */}
      <Dialog open={showBooking} onOpenChange={open => { if (!open) { setShowBooking(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book a Meeting</DialogTitle>
          </DialogHeader>
          {calendarLink !== null || (calendarLink === null && saving === false && formName && formEmail && formDate && meetings.length > 0 && false) ? (
            /* Show nothing here — actual success state below */
            null
          ) : null}
          {calendarLink !== null ? (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-[16px] font-medium text-foreground mb-1">Meeting booked!</p>
              <p className="text-[14px] text-muted-foreground mb-4">Meeting with {formName} has been created.</p>
              {calendarLink && (
                <div className="space-y-2">
                  <Button onClick={() => window.open(calendarLink, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Join Video Call
                  </Button>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(calendarLink)}>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy Link
                    </Button>
                  </div>
                  <p className="text-[12px] text-muted-foreground break-all mt-2">{calendarLink}</p>
                </div>
              )}
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={() => { setShowBooking(false); resetForm(); }}>Close</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[12px]">Lead name <span className="text-red-500">*</span></Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. John Smith" />
                </div>
                <div>
                  <Label className="text-[12px]">Lead email <span className="text-red-500">*</span></Label>
                  <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="john@example.com" type="email" />
                </div>
                <div>
                  <Label className="text-[12px]">Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[12px]">Time</Label>
                  <select
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-popover text-[14px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary"
                  >
                    {Array.from({ length: 4 * 24 }, (_, i) => {
                      const h = Math.floor(i / 4);
                      const m = (i % 4) * 15;
                      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <Label className="text-[12px]">Duration</Label>
                  <select
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-popover text-[14px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary"
                  >
                    {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-[12px]">Meeting type</Label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-popover text-[14px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary"
                  >
                    <option value="video_call">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
              </div>
              {formType === "video_call" && (
                <p className="text-[13px] text-muted-foreground mt-2">🎥 A Jitsi video link will be generated and sent to the lead</p>
              )}
              {formType === "phone" && (
                <p className="text-[13px] text-muted-foreground mt-2">📞 Make sure the phone number is in your notes</p>
              )}
              {formType === "in_person" && (
                <p className="text-[13px] text-muted-foreground mt-2">📍 Add the location in your notes</p>
              )}
              <div className="mt-2">
                <Label className="text-[12px]">Notes</Label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Any notes..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-popover text-[13px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 focus-visible:border-primary resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setShowBooking(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleBookMeeting} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Calendar className="h-4 w-4 mr-1.5" />}
                  Create Meeting
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMeeting(deleteId)}
        title="Delete meeting"
        description="This will permanently remove this meeting."
        confirmText="Delete"
        destructive
      />
    </DashboardLayout>
  );
};

const MeetingCard = ({
  m, onStatusChange, onDelete, overdue,
}: {
  m: Meeting;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  overdue?: boolean;
}) => {
  const info = typeInfo(m.meeting_type);
  const Icon = info.icon;
  const status = m.status || (m.completed ? "completed" : "scheduled");
  const si = statusInfo(status);

  return (
    <Card className={`border shadow-sm ${overdue ? "border-amber-300 bg-amber-50/50" : "border-border"}`}>
      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${overdue ? "bg-amber-100" : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${overdue ? "text-amber-600" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-foreground">{m.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[12px] ${overdue ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                {format(new Date(m.date), "d MMM yyyy 'at' HH:mm")}
              </span>
              {m.duration_minutes && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />{m.duration_minutes}min
                </span>
              )}
              <span className="text-[11px] rounded-md px-1.5 py-0.5 bg-muted text-muted-foreground">{info.label}</span>
              <span className={`text-[11px] rounded-md px-1.5 py-0.5 font-medium ${si.color}`}>{si.label}</span>
            </div>
            {m.notes && <p className="text-[13px] text-muted-foreground mt-1 truncate">{m.notes}</p>}
            {m.meeting_link && status === "scheduled" && (
              <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-[13px]" onClick={() => window.open(m.meeting_link!, "_blank")}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />Join Video Call
              </Button>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer shrink-0">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status === "scheduled" && (
              <>
                <DropdownMenuItem onClick={() => onStatusChange(m.id, "completed")}>
                  <Check className="h-4 w-4 mr-2" />Mark Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(m.id, "no_show")}>Mark No Show</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(m.id, "cancelled")}>Cancel Meeting</DropdownMenuItem>
              </>
            )}
            {status !== "scheduled" && (
              <DropdownMenuItem onClick={() => onStatusChange(m.id, "scheduled")}>Re-open</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(m.id)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default AdminMeetings;
