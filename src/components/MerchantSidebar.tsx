import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CreditCard, FileText, Zap, Megaphone, BarChart3, Settings, LogOut, UserPlus, ExternalLink, Wand2, ShieldCheck, Building2, PoundSterling, Calendar, Shield, HelpCircle, Sun, Moon, ClipboardCheck, Sparkles,
} from "lucide-react";
import { useTierLimits } from "@/hooks/useTierLimits";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import SlateLogo from "@/components/SlateLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { usePageGuidance } from "@/hooks/usePageGuidance";
import { GuidanceOverlay } from "@/components/GuidanceOverlay";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const producerNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Subscribers", url: "/dashboard/subscribers", icon: Users },
  { title: "Collections", url: "/dashboard/collections", icon: ClipboardCheck },
  { title: "Plans", url: "/dashboard/plans", icon: CreditCard },
  { title: "Content", url: "/dashboard/content", icon: FileText },
  { title: "Product Drops", url: "/dashboard/drops", icon: Zap },
  { title: "Broadcasts", url: "/dashboard/broadcasts", icon: Megaphone },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { title: "Command Centre", url: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/dashboard/leads", icon: UserPlus },
  { title: "Producers", url: "/admin/producers", icon: Building2 },
  { title: "Demo Launcher", url: "/demo-setup", icon: Wand2 },
  { title: "Revenue", url: "/admin/revenue", icon: PoundSterling },
  { title: "Meetings", url: "/admin/meetings", icon: Calendar },
  { title: "Platform Health", url: "/admin/health", icon: Shield },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const [helpOpen, setHelpOpen] = useState(false);
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations, settings } = useDashboard();
  const { signOut, demoActive, accentColor, session } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { isFree, commissionPercent } = useTierLimits();
  const unreadMessages = 0;
  const [newLeadCount, setNewLeadCount] = useState(0);

  // Page guidance
  const {
    steps, showGuidance, currentStep, nextStep, skipGuidance, replayGuidance, resetAllGuides, hasSteps,
  } = usePageGuidance(location.pathname);

  useEffect(() => {
    if (session.role !== "admin") return;
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .then(({ count }) => setNewLeadCount(count || 0));
  }, [session.role]);

  const profileBusinessName = session.profile?.business_name || "";
  const fallbackProfileSlug =
    session.profile?.url_slug ||
    (profileBusinessName
      ? profileBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "");

  const storefrontSlug =
    settings.urlSlug ||
    settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    fallbackProfileSlug;

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/");
  };

  const logoInitial = settings.businessName ? settings.businessName.charAt(0).toUpperCase() : "S";
  const showBrandHeader = demoActive && settings.businessName !== "The Harbour Fish Co.";

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0" style={{ width: collapsed ? undefined : "230px" }}>
        <SidebarContent className="bg-sidebar">
          {/* Admin badge — hide in demo mode */}
          {session.role === "admin" && !demoActive && !collapsed && (
            <div className="px-5 pt-4 pb-1">
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide uppercase"
                style={{ backgroundColor: "rgba(251, 191, 36, 0.15)", color: "#F59E0B" }}>
                <ShieldCheck className="h-3 w-3" />
                Admin
              </span>
            </div>
          )}

          {showBrandHeader ? (
            <div className="px-6 pt-7 pb-5 flex flex-col items-center">
              {settings.logoUrl ? (
                <div
                  className="rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ width: 52, height: 52, border: "2px solid rgba(255,255,255,0.2)" }}
                >
                  <img src={settings.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 52, height: 52, backgroundColor: accentColor, border: "2px solid rgba(255,255,255,0.2)" }}
                >
                  <span className="text-white font-bold" style={{ fontSize: 24, fontFamily: "'Satoshi', sans-serif" }}>
                    {logoInitial}
                  </span>
                </div>
              )}
              {!collapsed && (
                <span className="text-white font-bold text-center truncate w-full mt-2" style={{ fontSize: 17 }}>
                  {settings.businessName}
                </span>
              )}
              {!collapsed && settings.description && (
                <span className="text-center w-full mt-1 leading-tight" style={{ fontSize: 12, color: "hsl(213, 27%, 70%)", opacity: 0.7 }}>
                  {settings.description.length > 60 ? settings.description.slice(0, 60) + "…" : settings.description}
                </span>
              )}
              <div className="w-full mt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
          ) : (
            <div className="px-5 py-6">
              {!collapsed ? <SlateLogo size={20} dark /> : <SlateLogo size={18} dark />}
            </div>
          )}

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {((session.role === "admin" && !demoActive) ? adminNavItems : producerNavItems).map((item) => {
                  const badgeCount = item.title === "Leads" ? newLeadCount : 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-9">
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:text-white/60 transition-colors duration-150"
                          activeClassName="text-white font-medium"
                          activeStyle={demoActive ? { backgroundColor: `${accentColor}26` } : undefined}
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                          {!collapsed && (
                            <span className="text-[14px] font-medium flex-1">{item.title}</span>
                          )}
                          {!collapsed && badgeCount > 0 && (
                            <span
                              className={cn("w-5 h-5 rounded-full text-white text-[11px] font-medium flex items-center justify-center", !demoActive && "bg-amber")}
                              style={demoActive ? { backgroundColor: accentColor } : undefined}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-sidebar">
          {!collapsed && (
            <div className="px-5 pb-5">
              <div className="border-t border-sidebar-border pt-4 space-y-3">
                {/* Help & Guidance */}
                {session.role !== "admin" || demoActive ? (
                   <div className="relative">
                    <button
                      onClick={() => setHelpOpen((v) => !v)}
                      className="flex items-center gap-2 text-[13px] text-sidebar-foreground/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
                      Help & Guidance
                    </button>
                    {helpOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setHelpOpen(false)} onKeyDown={(e) => e.key === "Escape" && setHelpOpen(false)} tabIndex={-1} />
                        <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                          {hasSteps && (
                            <button
                              onClick={() => { replayGuidance(); setHelpOpen(false); }}
                              className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors"
                            >
                              Show guide for this page
                            </button>
                          )}
                          <button
                            onClick={() => { resetAllGuides(); toast.success("All guides reset — they'll show again on next visit"); setHelpOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors"
                          >
                            Reset all guides
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-[13px] text-sidebar-foreground/50 hover:text-white transition-colors cursor-pointer"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Sun className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </button>
                {/* Upgrade badge for free tier */}
                {isFree && !demoActive && (
                  <button
                    onClick={() => navigate("/dashboard/upgrade")}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Upgrade to Standard
                  </button>
                )}
                <div>
                  <p className="text-caption text-sidebar-foreground/50">Commission</p>
                  <p className="text-[13px] font-medium text-sidebar-foreground">{commissionPercent}% on revenue</p>
                </div>
                {storefrontSlug && (
                  <button
                    onClick={() => navigate(`/store/${storefrontSlug}`)}
                    className="flex items-center gap-2 text-[13px] text-sidebar-foreground/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                    My Storefront
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[13px] text-sidebar-foreground/50 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Page guidance overlay */}
      {showGuidance && (
        <GuidanceOverlay
          steps={steps}
          currentStep={currentStep}
          onNext={nextStep}
          onSkip={skipGuidance}
        />
      )}
    </>
  );
}
