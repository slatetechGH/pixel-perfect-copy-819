import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus, Building2, Wand2, PoundSterling, Calendar, Shield, ExternalLink,
  Download, Plus, Loader2, Users, TrendingUp, Bell, Zap, Mail, AlertTriangle,
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

const tileAccents: Record<string, string> = {
  "Leads & Enquiries": "hsl(38, 92%, 50%)",
  "Producers": "hsl(217, 91%, 60%)",
  "Demo Launcher": "hsl(270, 60%, 60%)",
  "Revenue & Commission": "hsl(160, 84%, 39%)",
  "Meetings & Follow-ups": "hsl(180, 60%, 45%)",
  "Platform Health": "hsl(215, 16%, 65%)",
};

const statConfig = [
  { label: "Total Producers", icon: Building2, bg: "hsl(217, 91%, 95%)", iconColor: "hsl(217, 91%, 60%)" },
  { label: "Total Subscribers", icon: Users, bg: "hsl(160, 84%, 93%)", iconColor: "hsl(160, 84%, 39%)" },
  { label: "Platform MRR", icon: PoundSterling, bg: "hsl(38, 92%, 93%)", iconColor: "hsl(38, 92%, 50%)" },
  { label: "Commission (8%)", icon: TrendingUp, bg: "hsl(270, 60%, 93%)", iconColor: "hsl(270, 60%, 60%)" },
  { label: "New Leads", icon: Bell, bg: "hsl(25, 95%, 93%)", iconColor: "hsl(25, 95%, 53%)" },
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

      // Filter follow-up leads that haven't been contacted in 3+ days
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
  const displayGreeting = adminName ? `${getGreeting()}, ${adminName.split(" ")[0]}` : getGreeting();
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
      preview: [{ label: "Quick Launch", sub: "Configure demo experiences" }],
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

  return (
    <DashboardLayout title="Command Centre" subtitle="">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-foreground">{displayGreeting}</h2>
        <p className="text-[14px] text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statConfig.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="rounded-xl border border-border p-4"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[12px] text-muted-foreground font-medium">{s.label}</p>
                <Icon className="h-4 w-4" style={{ color: s.iconColor }} strokeWidth={1.5} />
              </div>
              <p className="text-[22px] font-semibold text-foreground">{statValues[i]}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tiles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {tiles.map((tile, i) => {
          const accent = tileAccents[tile.title] || "hsl(215, 16%, 65%)";
          return (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
            >
              <Card
                className="border border-border bg-card hover:shadow-lg hover:border-foreground/15 transition-all duration-200 cursor-pointer group overflow-hidden"
                style={{ borderLeftWidth: 3, borderLeftColor: accent, minHeight: 160 }}
                onClick={() => navigate(tile.route)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <tile.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                      <h3 className="text-[15px] font-semibold text-foreground">{tile.title}</h3>
                    </div>
                    {tile.badge && (
                      <span className="inline-flex items-center rounded-full bg-amber/15 text-amber px-2 py-0.5 text-[12px] font-semibold">
                        {tile.badge}
                      </span>
                    )}
                    {tile.healthDot && (
                      <span className="flex items-center gap-1.5 text-[12px] text-success font-medium">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        Healthy
                      </span>
                    )}
                  </div>
                  {"subtitle" in tile && tile.subtitle && (
                    <p className="text-[12px] text-muted-foreground mb-2">{tile.subtitle}</p>
                  )}
                  <div className="space-y-2">
                    {tile.preview.map((p, j) => (
                      <div key={j} className="flex items-center justify-between gap-2">
                        <span className="text-[13px] text-foreground truncate min-w-0">{p.label}</span>
                        <span className="text-[12px] text-muted-foreground shrink-0 ml-2 line-clamp-1">{p.sub}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Follow-Up Reminders */}
      {(followUpLeads.length > 0 || overdueMeetings.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-[16px] font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Follow-Up Reminders
          </h3>

          <div className="space-y-3">
            {followUpLeads.map(lead => (
              <Card key={lead.id} className="border border-amber-200 bg-amber-50/50">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{lead.business_name || lead.name || lead.email}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {lead.last_contacted_at
                        ? `Last contacted ${formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}`
                        : "Never contacted"
                      }
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${lead.email}`}>
                      <Mail className="h-4 w-4 mr-1" />Contact Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}

            {overdueMeetings.map(m => (
              <Card key={m.id} className="border border-amber-200 bg-amber-50/50">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{m.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      Meeting was {formatDistanceToNow(new Date(m.date), { addSuffix: true })} — update status?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/meetings")}>
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Button size="sm" onClick={() => navigate("/admin/meetings")} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10 min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1.5" />New Meeting
        </Button>
        <Button size="sm" onClick={exportLeadsCSV} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10 min-h-[44px] w-full sm:w-auto">
          <Download className="h-4 w-4 mr-1.5" />Export Leads CSV
        </Button>
        <Button size="sm" onClick={() => window.open("https://slatetech.co.uk", "_blank")} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10 min-h-[44px] w-full sm:w-auto">
          <ExternalLink className="h-4 w-4 mr-1.5" />View Live Site
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminCommandCentre;
