import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus, Building2, Wand2, PoundSterling, Calendar, Shield, ExternalLink,
  Download, Plus, Loader2, Users, TrendingUp, Bell, Mail, AlertTriangle,
  CheckCircle2, Rocket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface QuickStats {
  totalProducers: number;
  totalSubscribers: number;
  platformMRR: number;
  platformCommission: number;
  newLeadsCount: number;
  followUpCount: number;
}

interface FollowUpLead {
  id: string;
  name: string | null;
  email: string;
  business_name: string | null;
  last_contacted_at: string | null;
  status: string;
}

interface OverdueMeeting {
  id: string;
  title: string;
  date: string;
  status: string | null;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const getMotivation = () => {
  const h = new Date().getHours();
  if (h < 12) return "Let's make today count";
  if (h < 18) return "Keep the momentum going";
  return "Time to wrap up the day";
};

const tileAccents: Record<string, string> = {
  "Leads & Enquiries": "hsl(38, 92%, 50%)",
  "Producers": "hsl(217, 91%, 60%)",
  "Demo Launcher": "hsl(270, 60%, 60%)",
  "Revenue & Commission": "hsl(160, 84%, 39%)",
  "Meetings & Follow-ups": "hsl(180, 60%, 45%)",
  "Platform Health": "hsl(215, 16%, 65%)",
};

const tileDescriptions: Record<string, string> = {
  "Leads & Enquiries": "Manage incoming enquiries and signups",
  "Producers": "View and manage all producers",
  "Demo Launcher": "Configure and launch demo experiences",
  "Revenue & Commission": "Track platform revenue and earnings",
  "Meetings & Follow-ups": "Schedule and manage meetings",
  "Platform Health": "Monitor system status and functions",
};

const statConfig = [
  { label: "Total producers", icon: Building2, bg: "hsl(217, 91%, 95%)", iconColor: "hsl(217, 91%, 60%)" },
  { label: "Total subscribers", icon: Users, bg: "hsl(160, 84%, 93%)", iconColor: "hsl(160, 84%, 39%)" },
  { label: "Platform MRR", icon: PoundSterling, bg: "hsl(38, 92%, 93%)", iconColor: "hsl(38, 92%, 50%)" },
  { label: "Commission (8%)", icon: TrendingUp, bg: "hsl(38, 92%, 93%)", iconColor: "hsl(38, 92%, 50%)" },
  { label: "New leads", icon: Bell, bg: "hsl(38, 92%, 93%)", iconColor: "hsl(25, 95%, 53%)" },
  { label: "Follow-ups due", icon: AlertTriangle, bg: "hsl(0, 84%, 95%)", iconColor: "hsl(0, 72%, 51%)" },
];

const AdminCommandCentre = () => {
  const navigate = useNavigate();
  const { session } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({
    totalProducers: 0, totalSubscribers: 0, platformMRR: 0,
    platformCommission: 0, newLeadsCount: 0, followUpCount: 0,
  });
  const [followUpLeads, setFollowUpLeads] = useState<FollowUpLead[]>([]);
  const [overdueMeetings, setOverdueMeetings] = useState<OverdueMeeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<{ title: string; date: string }[]>([]);
  const [recentLeads, setRecentLeads] = useState<{ name: string; date: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      const [rolesRes, subsRes, newLeadsRes, followUpRes, subscriptionsRes, meetingsUpRes, meetingsOverdueRes, recentLeadsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "producer"),
        supabase.from("subscribers").select("id, status"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("leads").select("id, name, email, business_name, last_contacted_at, status").eq("status", "follow_up"),
        supabase.from("subscriptions").select("amount_paid, status").eq("status", "active"),
        supabase.from("admin_meetings").select("title, date").eq("completed", false).gte("date", nowIso).order("date", { ascending: true }).limit(3),
        supabase.from("admin_meetings").select("id, title, date, status").eq("completed", false).lt("date", nowIso).order("date", { ascending: false }).limit(5),
        supabase.from("leads").select("name, email, created_at").eq("status", "new").order("created_at", { ascending: false }).limit(3),
      ]);

      const producerCount = (rolesRes.data || []).length;
      const activeSubs = (subsRes.data || []).filter((s: any) => s.status === "active").length;
      const mrr = (subscriptionsRes.data || []).reduce((sum: number, s: any) => sum + (s.amount_paid || 0), 0) / 100;

      const allFollowUps = (followUpRes.data || []) as FollowUpLead[];
      const staleFollowUps = allFollowUps.filter(l => {
        if (!l.last_contacted_at) return true;
        return new Date(l.last_contacted_at) < new Date(threeDaysAgo);
      });

      setStats({
        totalProducers: producerCount,
        totalSubscribers: activeSubs,
        platformMRR: mrr,
        platformCommission: mrr * 0.08,
        newLeadsCount: newLeadsRes.count || 0,
        followUpCount: staleFollowUps.length,
      });

      setFollowUpLeads(staleFollowUps);
      setOverdueMeetings((meetingsOverdueRes.data || []) as OverdueMeeting[]);
      setUpcomingMeetings((meetingsUpRes.data || []).map((m: any) => ({ title: m.title, date: m.date })));
      setRecentLeads((recentLeadsRes.data || []).map((l: any) => ({
        name: l.name || l.email,
        date: new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      })));

      setLoading(false);
    };
    load();
  }, []);

  const adminName = session.profile?.display_name || session.profile?.business_name || "";
  const firstName = adminName ? adminName.split(" ")[0] : "";
  const displayGreeting = firstName ? `${getGreeting()}, ${firstName} 👋` : `${getGreeting()} 👋`;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <DashboardLayout title="Command Centre" subtitle="">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const statValues = [
    stats.totalProducers,
    stats.totalSubscribers,
    `£${stats.platformMRR.toFixed(0)}`,
    `£${stats.platformCommission.toFixed(2)}`,
    stats.newLeadsCount,
    stats.followUpCount,
  ];

  const nextMeeting = upcomingMeetings[0];

  const tiles = [
    {
      title: "Leads & Enquiries",
      icon: UserPlus,
      badge: stats.newLeadsCount > 0 ? String(stats.newLeadsCount) : undefined,
      badgeLabel: "new",
      route: "/dashboard/leads",
      preview: recentLeads.length > 0
        ? recentLeads.map(l => ({ label: l.name, sub: l.date }))
        : [{ label: "No new leads", sub: "Leads appear here" }],
      subtitle: `${stats.newLeadsCount} new, ${stats.followUpCount} follow up`,
      urgent: stats.newLeadsCount > 0,
    },
    {
      title: "Producers",
      icon: Building2,
      badge: String(stats.totalProducers),
      badgeLabel: "total",
      route: "/admin/producers",
      preview: [{ label: `${stats.totalProducers} registered`, sub: "View all →" }],
    },
    {
      title: "Demo Launcher",
      icon: Wand2,
      route: "/demo-setup",
      preview: [{ label: "Quick launch", sub: "Configure demo experiences" }],
    },
    {
      title: "Revenue & Commission",
      icon: PoundSterling,
      badge: `£${stats.platformCommission.toFixed(0)}`,
      badgeLabel: "commission",
      route: "/admin/revenue",
      preview: stats.platformMRR > 0
        ? [{ label: `Platform MRR: £${stats.platformMRR.toFixed(0)}`, sub: `Commission: £${stats.platformCommission.toFixed(2)}` }]
        : [{ label: "£0 revenue", sub: "Revenue appears once producers have subscribers" }],
    },
    {
      title: "Meetings & Follow-ups",
      icon: Calendar,
      badge: upcomingMeetings.length > 0 ? String(upcomingMeetings.length) : undefined,
      badgeLabel: "upcoming",
      route: "/admin/meetings",
      preview: nextMeeting
        ? [{ label: nextMeeting.title, sub: new Date(nextMeeting.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }]
        : [{ label: "No meetings scheduled", sub: "Book your first meeting" }],
    },
    {
      title: "Platform Health",
      icon: Shield,
      route: "/admin/health",
      preview: [{ label: "All systems running", sub: "Edge functions deployed" }],
      healthDot: true,
    },
  ];

  const exportLeadsCSV = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) { toast.info("No leads to export"); return; }
    const headers = ["Name", "Email", "Type", "Status", "Business", "Date"];
    const rows = data.map((l: any) => [l.name || "", l.email, l.type, l.status, l.business_name || "", l.created_at]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads-export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported!");
  };

  const hasReminders = followUpLeads.length > 0 || overdueMeetings.length > 0;

  return (
    <DashboardLayout title="Command Centre" subtitle="">
      {/* Hero greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-8 mb-6"
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #334155 60%, #D97706 180%)",
        }}
      >
        <h2 className="text-[28px] font-bold text-white leading-tight">{displayGreeting}</h2>
        <p className="text-white/60 text-[14px] mt-1.5">{today} · {getMotivation()}</p>
      </motion.div>

      {/* Quick action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex flex-wrap gap-2.5 mb-7"
      >
        <Button size="sm" onClick={() => navigate("/dashboard/leads")} className="h-10 gap-1.5">
          <UserPlus className="h-4 w-4" />New lead
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/admin/meetings")} className="h-10 gap-1.5">
          <Calendar className="h-4 w-4" />Book meeting
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/demo-setup")} className="h-10 gap-1.5">
          <Rocket className="h-4 w-4" />Launch demo
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.open("https://slatetech.co.uk", "_blank")} className="h-10 gap-1.5">
          <ExternalLink className="h-4 w-4" />View live site
        </Button>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statConfig.map((s, i) => {
          const Icon = s.icon;
          const isPulsing = (s.label === "New leads" && stats.newLeadsCount > 0) ||
                           (s.label === "Follow-ups due" && stats.followUpCount > 0);
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
              className="bg-white rounded-xl border border-border/60 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.bg }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: s.iconColor }} strokeWidth={2} />
                </div>
                {isPulsing && (
                  <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: s.iconColor }} />
                )}
              </div>
              <p className="text-[28px] font-bold text-foreground leading-none">{statValues[i]}</p>
              <p className="text-[12px] text-muted-foreground mt-1.5 font-medium">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tiles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {tiles.map((tile, i) => {
          const accent = tileAccents[tile.title] || "hsl(215, 16%, 65%)";
          const TileIcon = tile.icon;
          const desc = tileDescriptions[tile.title] || "";
          return (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
            >
              <Card
                className="border border-border/60 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden relative"
                style={{ minHeight: 180 }}
                onClick={() => navigate(tile.route)}
              >
                {/* Accent hover border */}
                <div
                  className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-100 transition-all duration-200 pointer-events-none"
                  style={{ borderColor: `${accent}00` }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${accent}18` }}
                    >
                      <TileIcon className="h-5 w-5" style={{ color: accent }} strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tile.badge && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {tile.badge}
                        </span>
                      )}
                      {tile.healthDot && (
                        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#10B981" }}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#10B981" }} />
                          Healthy
                        </span>
                      )}
                      {"urgent" in tile && tile.urgent && (
                        <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                      )}
                    </div>
                  </div>

                  <h3 className="text-[18px] font-bold text-foreground mb-0.5">{tile.title}</h3>
                  <p className="text-[12px] text-muted-foreground mb-3">{desc}</p>

                  {"subtitle" in tile && tile.subtitle && (
                    <p className="text-[13px] font-medium mb-2" style={{ color: accent }}>{tile.subtitle}</p>
                  )}

                  <div className="space-y-1.5 border-t border-border/40 pt-2.5">
                    {tile.preview.map((p, j) => (
                      <div key={j} className="flex items-center justify-between gap-2">
                        <span className="text-[13px] text-foreground/80 truncate min-w-0">{p.label}</span>
                        <span className="text-[12px] text-muted-foreground shrink-0 ml-2">{p.sub}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Follow-up reminders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-[16px] font-bold text-foreground mb-4 flex items-center gap-2">
          {hasReminders ? (
            <>
              <AlertTriangle className="h-4 w-4" style={{ color: "#D97706" }} />
              Needs your attention
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />
              You're all caught up! 🎉
            </>
          )}
        </h3>

        {hasReminders ? (
          <div className="space-y-2.5">
            {followUpLeads.map(lead => (
              <div
                key={lead.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white border border-border/60 p-4"
                style={{ borderLeftWidth: 4, borderLeftColor: "#D97706" }}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{lead.business_name || lead.name || lead.email}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {lead.last_contacted_at
                      ? `${formatDistanceToNow(new Date(lead.last_contacted_at))} since last contact`
                      : "Never contacted"
                    }
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="h-4 w-4 mr-1" />Contact
                  </a>
                </Button>
              </div>
            ))}

            {overdueMeetings.map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white border border-border/60 p-4"
                style={{ borderLeftWidth: 4, borderLeftColor: "#D97706" }}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{m.title}</p>
                  <p className="text-[12px] text-muted-foreground">
                    Meeting was {formatDistanceToNow(new Date(m.date), { addSuffix: true })} — update status?
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/meetings")} className="shrink-0">
                  Update
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-lg border border-border/40 bg-white">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: "#10B981" }} />
            <p className="text-[14px] text-muted-foreground">No outstanding follow-ups or overdue meetings</p>
          </div>
        )}
      </motion.div>

      {/* Secondary actions */}
      <div className="flex flex-wrap gap-2.5">
        <Button size="sm" variant="outline" onClick={() => navigate("/admin/meetings")} className="h-10 gap-1.5">
          <Plus className="h-4 w-4" />New meeting
        </Button>
        <Button size="sm" variant="outline" onClick={exportLeadsCSV} className="h-10 gap-1.5">
          <Download className="h-4 w-4" />Export leads CSV
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminCommandCentre;