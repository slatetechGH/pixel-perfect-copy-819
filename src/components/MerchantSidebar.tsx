import {
  LayoutDashboard, Users, CreditCard, FileText, Zap, MessageSquare, BarChart3, Settings, LogOut, UserPlus,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import SlateLogo from "@/components/SlateLogo";
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
  { title: "Leads", url: "/dashboard/leads", icon: UserPlus },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { conversations } = useDashboard();
  const { leads, setSession } = useApp();
  const unreadMessages = conversations.filter(c => c.unread).length;
  const newLeadCount = leads.filter(l => l.status === "new").length;

  const handleLogout = () => {
    setSession({ isLoggedIn: false, currentUser: "" });
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ width: collapsed ? undefined : "230px" }}>
      <SidebarContent className="bg-sidebar">
        <div className="px-5 py-6">
          {!collapsed ? (
            <SlateLogo size={20} dark />
          ) : (
            <SlateLogo size={18} dark />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const badgeCount = item.title === "Messages" ? unreadMessages : item.title === "Leads" ? newLeadCount : 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-9">
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:text-white/60 transition-colors duration-150"
                        activeClassName="bg-sidebar-accent text-white font-medium"
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                        {!collapsed && (
                          <span className="text-[14px] font-medium flex-1">{item.title}</span>
                        )}
                        {!collapsed && badgeCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-amber text-white text-[11px] font-medium flex items-center justify-center">
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
                <p className="text-caption text-sidebar-foreground/50">Current plan</p>
                <p className="text-[13px] font-medium text-sidebar-foreground">Growth — £79/mo</p>
              </div>
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
