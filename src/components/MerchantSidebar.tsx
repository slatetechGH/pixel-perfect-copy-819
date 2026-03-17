import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Zap,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Subscribers", url: "/subscribers", icon: Users },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Content", url: "/content", icon: FileText },
  { title: "Product Drops", url: "/drops", icon: Zap },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ width: collapsed ? undefined : "230px" }}>
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-0">
          {!collapsed ? (
            <span className="text-[20px] font-bold text-white tracking-tight">
              slate<span className="text-amber">.</span>
            </span>
          ) : (
            <span className="text-[20px] font-bold text-white tracking-tight">
              s<span className="text-amber">.</span>
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-9">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:text-white/60 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-white font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                      {!collapsed && (
                        <span className="text-[14px] font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar">
        {!collapsed && (
          <div className="px-5 pb-5">
            <div className="border-t border-sidebar-border pt-4">
              <p className="text-caption text-sidebar-foreground/50">Current plan</p>
              <p className="text-[13px] font-medium text-sidebar-foreground">Growth — £79/mo</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
