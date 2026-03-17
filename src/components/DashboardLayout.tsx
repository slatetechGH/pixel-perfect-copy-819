import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MerchantSidebar } from "@/components/MerchantSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MerchantSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* No top bar — title is inline in content area */}
          <main className="flex-1 p-8 overflow-auto">
            {/* Page header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="text-muted-foreground -ml-2 mr-1" />
                  <h1 className="text-[24px] font-bold text-foreground leading-tight">{title}</h1>
                </div>
                {subtitle && <p className="text-[14px] text-muted-foreground mt-0.5 ml-9">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
