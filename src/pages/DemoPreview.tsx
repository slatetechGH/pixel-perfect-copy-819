import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import SlateLogo from "@/components/SlateLogo";
import { X, Pencil } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface DemoData {
  settings: {
    businessName: string;
    businessType: string;
    description: string;
    accentColor: string;
    logoUrl: string | null;
    coverUrl: string | null;
    urlSlug: string;
  };
  plans: any[];
  drops: any[];
  content: any[];
  subscribers: any[];
  kpi: Record<string, string>;
  revenueChartData: any[];
  subscriberGrowthData: any[];
  tierBreakdown: any[];
  activityFeed: any[];
}

const DemoPreview = () => {
  const { businessSlug } = useParams();
  const [data, setData] = useState<DemoData | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const raw = localStorage.getItem("slate_demo_preview");
    if (raw) {
      try { setData(JSON.parse(raw)); } catch { setData(null); }
    }
  }, []);

  const handleClose = () => {
    localStorage.removeItem("slate_demo_preview");
    window.close();
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-[16px] font-medium text-foreground mb-2">No demo data found</p>
          <p className="text-[14px] text-muted-foreground">Launch a demo from the Demo Launcher first.</p>
        </div>
      </div>
    );
  }

  const { settings, plans, drops, content, subscribers, kpi, revenueChartData, tierBreakdown, activityFeed } = data;
  const accent = settings.accentColor || "#F59E0B";

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "subscribers", label: "Subscribers" },
    { key: "plans", label: "Plans" },
    { key: "content", label: "Content" },
    { key: "drops", label: "Drops" },
  ];

  const activeSubs = subscribers.filter(s => s.status === "active");

  return (
    <div className="min-h-screen flex flex-col">
      {/* DEMO MODE banner */}
      <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 44, backgroundColor: accent, color: "#fff" }}>
        <span className="text-[13px] font-bold tracking-wide">🎭 DEMO MODE — {settings.businessName}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-[12px] font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors cursor-pointer">
            <Pencil size={12} /> Edit Demo
          </button>
          <button onClick={handleClose} className="flex items-center gap-1 text-[12px] font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors cursor-pointer">
            <X size={12} /> Close Demo
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[220px] bg-foreground text-white shrink-0 flex flex-col">
          <div className="p-5 pb-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="h-8 w-auto mb-2" />
            ) : (
              <p className="text-[16px] font-bold mb-2">{settings.businessName}</p>
            )}
            <p className="text-[11px] text-white/50">{settings.businessType}</p>
          </div>
          <nav className="flex-1 px-3 space-y-0.5">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors cursor-pointer ${activeTab === item.key ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="text-[10px]">Powered by</span>
              <SlateLogo size={10} dark asLink={false} />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-secondary p-6 overflow-auto">
          {/* Cover photo */}
          {settings.coverUrl && activeTab === "dashboard" && (
            <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ height: 140 }}>
              <img src={settings.coverUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-5">
                <h1 className="text-white font-bold text-[28px]">{settings.businessName.toUpperCase()}</h1>
                <p className="text-white/70 text-[14px]">{settings.description}</p>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {!settings.coverUrl && <h1 className="text-[24px] font-bold text-foreground mb-1">{settings.businessName}</h1>}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Monthly Income" value={kpi.mrr || "£0"} change={kpi.mrrChange || "+0%"} trend="up" />
                <MetricCard title="Current Customers" value={kpi.totalSubs || "0"} change={kpi.subsChange || "+0%"} trend="up" delay={60} />
                <MetricCard title="Customers Lost" value={kpi.churn || "0%"} change={kpi.churnChange || "0%"} trend="down" delay={120} />
                <MetricCard title="Avg. Customer Value" value={kpi.arpu || "£0"} change={kpi.arpuChange || "+0%"} trend="up" delay={180} />
              </div>

              {revenueChartData.length > 0 && (
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-2 px-7 pt-7">
                    <CardTitle className="text-[15px] font-medium text-foreground">Income Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="px-7 pb-7">
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(215 16% 75%)" />
                          <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 16% 75%)" />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke={accent} fill={accent} fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tierBreakdown.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Card className="border-0 shadow-card">
                    <CardHeader className="pb-2 px-7 pt-7">
                      <CardTitle className="text-[15px] font-medium text-foreground">Customers by Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="px-7 pb-7">
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={tierBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                              {tierBreakdown.map((entry: any, i: number) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-card">
                    <CardHeader className="pb-2 px-7 pt-7">
                      <CardTitle className="text-[15px] font-medium text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-7 pb-7">
                      <div className="space-y-2 max-h-[200px] overflow-auto">
                        {(activityFeed || []).slice(0, 8).map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-[13px]">
                            <span className="text-muted-foreground shrink-0">{item.time || ""}</span>
                            <span className="text-foreground">{item.text || item.message || ""}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === "subscribers" && (
            <div>
              <h1 className="text-[24px] font-bold text-foreground mb-5">Customers</h1>
              <Card className="border-0 shadow-card">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-[12px] font-medium text-muted-foreground py-3 px-5">Name</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground py-3">Email</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground py-3">Plan</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground py-3">Status</th>
                        <th className="text-right text-[12px] font-medium text-muted-foreground py-3 pr-5">Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.slice(0, 20).map((s: any) => (
                        <tr key={s.id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 px-5 text-[14px] font-medium text-foreground">{s.name}</td>
                          <td className="py-3 text-[14px] text-muted-foreground">{s.email}</td>
                          <td className="py-3 text-[14px] text-foreground">{s.plan}</td>
                          <td className="py-3">
                            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 pr-5 text-right text-[14px] text-foreground">{s.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "plans" && (
            <div>
              <h1 className="text-[24px] font-bold text-foreground mb-5">Plans</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((p: any) => (
                  <Card key={p.id} className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <h3 className="text-[16px] font-semibold text-foreground mb-1">{p.name}</h3>
                      <p className="text-[20px] font-bold mb-3" style={{ color: accent }}>{p.price}</p>
                      <p className="text-[13px] text-muted-foreground mb-3">{p.subscribers} customers</p>
                      <ul className="space-y-1.5">
                        {(p.benefits || []).map((b: string, i: number) => (
                          <li key={i} className="text-[13px] text-foreground flex items-start gap-2">
                            <span style={{ color: accent }}>✓</span> {b}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div>
              <h1 className="text-[24px] font-bold text-foreground mb-5">Content</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.map((c: any) => (
                  <Card key={c.id} className="border-0 shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{c.type}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                      </div>
                      <h3 className="text-[15px] font-medium text-foreground">{c.title}</h3>
                      {c.views > 0 && <p className="text-[12px] text-muted-foreground mt-1">{c.views} views</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "drops" && (
            <div>
              <h1 className="text-[24px] font-bold text-foreground mb-5">Product Drops</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drops.map((d: any) => (
                  <Card key={d.id} className="border-0 shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[15px] font-medium text-foreground">{d.title}</h3>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${d.status === "live" ? "bg-success/10 text-success" : d.status === "ended" ? "bg-muted text-muted-foreground" : "bg-amber/10 text-amber"}`}>{d.status}</span>
                      </div>
                      <p className="text-[14px] font-semibold" style={{ color: accent }}>{d.price}</p>
                      <p className="text-[13px] text-muted-foreground mt-1">{d.total - d.remaining} sold / {d.total} total</p>
                      <p className="text-[13px] text-foreground mt-1">Income: {d.revenue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DemoPreview;
