import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CreditCard, FileText, Zap, MessageSquare, BarChart3, Settings, LogOut, UserPlus, ExternalLink, Wand2, ShieldCheck, Building2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import SlateLogo from "@/components/SlateLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Subscribers", url: "/dashboard/subscribers", icon: Users },
  { title: "Plans", url: "/dashboard/plans", icon: CreditCard },
  { title: "Content", url: "/dashboard/content", icon: FileText },
  { title: "Product Drops", url: "/dashboard/drops", icon: Zap },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Leads", url: "/dashboard/leads", icon: UserPlus, adminOnly: true },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Demo Launcher", url: "/demo-setup", icon: Wand2, adminOnly: true },
  { title: "Producers", url: "/admin/producers", icon: Building2, adminOnly: true },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { conversations, settings } = useDashboard();
  const { signOut, demoActive, accentColor, session } = useApp();
  const unreadMessages = conversations.filter(c => c.unread).length;
  const [newLeadCount, setNewLeadCount] = useState(0);

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

  // In demo mode with a custom business, show prominent brand header
  const showBrandHeader = demoActive && settings.businessName !== "The Harbour Fish Co.";

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ width: collapsed ? undefined : "230px" }}>
      <SidebarContent className="bg-sidebar">
        {/* Admin badge */}
        {session.role === "admin" && !collapsed && (
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
            {/* Large logo or initial */}
            {settings.logoUrl ? (
              <div
                className="rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{
                  width: 52, height: 52,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <img src={settings.logoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 52, height: 52,
                  backgroundColor: accentColor,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: 24, fontFamily: "'Satoshi', sans-serif" }}>
                  {logoInitial}
                </span>
              </div>
            )}
            {/* Business name */}
            {!collapsed && (
              <span
                className="text-white font-bold text-center truncate w-full mt-2"
                style={{ fontSize: 17 }}
              >
                {settings.businessName}
              </span>
            )}
            {/* Tagline */}
            {!collapsed && settings.description && (
              <span
                className="text-center w-full mt-1 leading-tight"
                style={{ fontSize: 12, color: "hsl(213, 27%, 70%)", opacity: 0.7 }}
              >
                {settings.description.length > 60 ? settings.description.slice(0, 60) + "…" : settings.description}
              </span>
            )}
            {/* Divider */}
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
              {navItems
                .filter(item => !('adminOnly' in item && item.adminOnly) || session.role === "admin")
                .map((item) => {
                const badgeCount = item.title === "Messages" ? unreadMessages : item.title === "Leads" ? newLeadCount : 0;
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
              <div>
                <p className="text-caption text-sidebar-foreground/50">Commission</p>
                <p className="text-[13px] font-medium text-sidebar-foreground">6% on revenue</p>
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
  );
}
