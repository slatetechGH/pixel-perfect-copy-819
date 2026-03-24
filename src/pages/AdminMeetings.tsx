import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Plus, Check, Clock, Loader2, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  date: string;
  notes: string | null;
  completed: boolean;
  producer_id: string | null;
  created_at: string;
}

const TYPES = [
  { value: "demo_call", label: "Demo Call" },
  { value: "onboarding", label: "Onboarding" },
  { value: "check_in", label: "Check-in" },
  { value: "follow_up", label: "Follow-up" },
  { value: "other", label: "Other" },
];

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};

const AdminMeetings = () => {
  const { session } = useApp();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("demo_call");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
  const upcoming = meetings.filter(m => !m.completed && new Date(m.date) >= now);
  const overdue = meetings.filter(m => !m.completed && new Date(m.date) < now);
  const completed = meetings.filter(m => m.completed);

  const handleCreate = async () => {
    if (!title.trim() || !date) { toast.error("Title and date required"); return; }
    setSaving(true);
    const dateTime = new Date(`${date}T${time}`).toISOString();
    const { error } = await supabase.from("admin_meetings").insert({
      admin_id: session.supabaseUser!.id,
      title: title.trim(),
      meeting_type: meetingType,
      date: dateTime,
      notes: notes.trim() || null,
    } as any);
    if (error) { toast.error("Failed to create meeting"); setSaving(false); return; }
    toast.success("Meeting created");
    setTitle(""); setDate(""); setTime("10:00"); setNotes(""); setShowForm(false);
    setSaving(false);
    fetchMeetings();
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, completed } : m));
    await supabase.from("admin_meetings").update({ completed } as any).eq("id", id);
    toast.success(completed ? "Marked complete" : "Marked incomplete");
  };

  const deleteMeeting = async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    await supabase.from("admin_meetings").delete().eq("id", id);
    toast.success("Meeting deleted");
  };

  const typeLabel = (val: string) => TYPES.find(t => t.value === val)?.label || val;

  const MeetingRow = ({ m, showOverdue }: { m: Meeting; showOverdue?: boolean }) => (
    <div className={`flex items-start justify-between py-4 border-b border-border/50 last:border-0 ${showOverdue ? "bg-amber/5 -mx-5 px-5 rounded-lg" : ""}`}>
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={() => toggleComplete(m.id, !m.completed)}
          className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
            m.completed ? "bg-success border-success text-white" : "border-border hover:border-foreground"
          }`}
        >
          {m.completed && <Check className="h-3 w-3" />}
        </button>
        <div className="min-w-0">
          <p className={`text-[14px] font-medium ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[12px] ${showOverdue ? "text-amber font-medium" : "text-muted-foreground"}`}>
              {formatDateTime(m.date)}
            </span>
            <span className="text-[11px] rounded-md px-1.5 py-0.5 bg-secondary text-muted-foreground">{typeLabel(m.meeting_type)}</span>
          </div>
          {m.notes && <p className="text-[13px] text-muted-foreground mt-1">{m.notes}</p>}
        </div>
      </div>
      <button onClick={() => setDeleteId(m.id)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0 ml-2 mt-0.5">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout title="Meetings & Follow-ups" subtitle="Track your meetings and tasks">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Meetings & Follow-ups"
      subtitle="Track your meetings and tasks"
      actions={
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1.5" />{showForm ? "Cancel" : "New Meeting"}
        </Button>
      }
    >
      {/* Create form */}
      {showForm && (
        <Card className="border-0 shadow-card mb-6">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-[12px]">Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Demo call with Riverside Farm" />
              </div>
              <div>
                <Label className="text-[12px]">Type</Label>
                <select
                  value={meetingType}
                  onChange={e => setMeetingType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[14px] focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[12px]">Date *</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-[12px]">Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <div className="mb-4">
              <Label className="text-[12px]">Notes</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes for this meeting..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 resize-none"
              />
            </div>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {(["upcoming", "completed"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[14px] font-medium transition-colors cursor-pointer border-b-2 capitalize ${
              activeTab === tab ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab} ({tab === "upcoming" ? upcoming.length + overdue.length : completed.length})
          </button>
        ))}
      </div>

      {activeTab === "upcoming" ? (
        <Card className="border-0 shadow-card">
          <CardContent className="px-5 pb-5 pt-2">
            {overdue.length === 0 && upcoming.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No upcoming meetings</p>
              </div>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[12px] font-semibold text-amber uppercase tracking-wider mb-1 mt-3">Overdue</p>
                    {overdue.map(m => <MeetingRow key={m.id} m={m} showOverdue />)}
                  </div>
                )}
                {upcoming.length > 0 && (
                  <div>
                    {overdue.length > 0 && <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-4">Upcoming</p>}
                    {upcoming.map(m => <MeetingRow key={m.id} m={m} />)}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card">
          <CardContent className="px-5 pb-5 pt-2">
            {completed.length === 0 ? (
              <div className="text-center py-12">
                <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No completed meetings yet</p>
              </div>
            ) : (
              completed.map(m => <MeetingRow key={m.id} m={m} />)
            )}
          </CardContent>
        </Card>
      )}

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

export default AdminMeetings;
