import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus, Building2, Wand2, PoundSterling, Calendar, Shield, ExternalLink,
  Download, Plus, Loader2, Users, TrendingUp, Bell, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface QuickStats {
  totalProducers: number;
  totalSubscribers: number;
  platformMRR: number;
  platformCommission: number;
  newLeadsThisWeek: number;
}

interface RecentLead {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
}

interface RecentProducer {
  id: string;
  business_name: string | null;
  email: string;
  created_at: string;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  producer_name: string | null;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
};

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
  { label: "New Leads (7d)", icon: Bell, bg: "hsl(25, 95%, 93%)", iconColor: "hsl(25, 95%, 53%)" },
];

const AdminCommandCentre = () => {
  const navigate = useNavigate();
  const { session } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({
    totalProducers: 0, totalSubscribers: 0, platformMRR: 0, platformCommission: 0, newLeadsThisWeek: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentProducers, setRecentProducers] = useState<RecentProducer[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [rolesRes, subsRes, leadsRes, leadsRecentRes, producersRes, subscriptionsRes, meetingsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "producer"),
        supabase.from("subscribers").select("id, status"),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo),
        supabase.from("leads").select("id, name, email, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("profiles").select("id, business_name, email, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("subscriptions").select("amount_paid, status").eq("status", "active"),
        supabase.from("admin_meetings").select("id, title, date, producer_id").eq("completed", false).gte("date", new Date().toISOString()).order("date", { ascending: true }).limit(2),
      ]);

      const producerIds = (rolesRes.data || []).map((r: any) => r.user_id);
      const activeSubs = (subsRes.data || []).filter((s: any) => s.status === "active").length;
      const mrr = (subscriptionsRes.data || []).reduce((sum: number, s: any) => sum + (s.amount_paid || 0), 0) / 100;

      setStats({
        totalProducers: producerIds.length,
        totalSubscribers: activeSubs,
        platformMRR: mrr,
        platformCommission: mrr * 0.08,
        newLeadsThisWeek: leadsRes.count || 0,
      });

      setRecentLeads((leadsRecentRes.data || []) as RecentLead[]);

      const allProfiles = (producersRes.data || []) as RecentProducer[];
      setRecentProducers(allProfiles.filter(p => producerIds.includes(p.id)).slice(0, 3));

      const meetings = (meetingsRes.data || []) as any[];
      const enriched: UpcomingMeeting[] = meetings.map(m => ({
        id: m.id,
        title: m.title,
        date: m.date,
        producer_name: null,
      }));
      setUpcomingMeetings(enriched);

      setLoading(false);
    };

    fetch();
  }, []);

  const exportLeadsCSV = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) { toast.info("No leads to export"); return; }
    const headers = ["Name", "Email", "Type", "Status", "Business", "Date"];
    const rows = data.map((l: any) => [l.name || "", l.email, l.type, l.status, l.business_name || "", l.created_at]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads-export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported!");
  };

  // Use display_name from profile, fallback to no name
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
    stats.newLeadsThisWeek,
  ];

  const tiles = [
    {
      title: "Leads & Enquiries",
      icon: UserPlus,
      badge: stats.newLeadsThisWeek > 0 ? String(stats.newLeadsThisWeek) : undefined,
      badgeLabel: "new this week",
      route: "/dashboard/leads",
      preview: recentLeads.length > 0
        ? recentLeads.map(l => ({ label: l.name || l.email, sub: formatDate(l.created_at) }))
        : [{ label: "No leads yet", sub: "Leads from your site appear here" }],
    },
    {
      title: "Producers",
      icon: Building2,
      badge: String(stats.totalProducers),
      badgeLabel: "total",
      route: "/admin/producers",
      preview: recentProducers.length > 0
        ? recentProducers.map(p => ({ label: p.business_name || p.email, sub: formatDate(p.created_at) }))
        : [{ label: "No producers yet", sub: "Producers appear here once registered" }],
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
      badgeLabel: "this month",
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
      preview: upcomingMeetings.length > 0
        ? upcomingMeetings.map(m => ({ label: m.title, sub: formatDate(m.date) }))
        : [{ label: "No meetings scheduled", sub: "Add your first meeting" }],
    },
    {
      title: "Platform Health",
      icon: Shield,
      route: "/admin/health",
      preview: [{ label: "All systems running", sub: "Edge functions deployed" }],
      healthDot: true,
    },
  ];

  return (
    <DashboardLayout title="Command Centre" subtitle="">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-foreground">{displayGreeting}</h2>
        <p className="text-[14px] text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Quick stats bar */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => navigate("/admin/meetings")} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10">
          <Plus className="h-4 w-4 mr-1.5" />New Meeting
        </Button>
        <Button size="sm" onClick={exportLeadsCSV} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10">
          <Download className="h-4 w-4 mr-1.5" />Export Leads CSV
        </Button>
        <Button size="sm" onClick={() => window.open("https://slatetech.co.uk", "_blank")} className="bg-foreground/5 text-foreground border border-border hover:bg-foreground/10">
          <ExternalLink className="h-4 w-4 mr-1.5" />View Live Site
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminCommandCentre;
