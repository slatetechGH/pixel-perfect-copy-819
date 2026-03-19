import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { demoActive, demoBusinessName, deactivateDemo } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    deactivateDemo();
    // Force reload to reset dashboard data
    window.location.href = "/dashboard";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MerchantSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-auto relative">
            {/* Demo mode pill */}
            {demoActive && (
              <div className="absolute top-3 right-8 z-10">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer transition-colors"
                    style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
                  >
                    Demo Mode: {demoBusinessName}
                    <ChevronDown size={12} />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-border z-20 py-1">
                        <button
                          onClick={() => { setDropdownOpen(false); navigate("/demo-setup"); }}
                          className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Edit demo
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); setResetConfirm(true); }}
                          className="w-full text-left px-3 py-2 text-[13px] text-destructive hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Reset to default
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

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

            {/* Powered by watermark */}
            {demoActive && (
              <div className="fixed bottom-4 right-4 text-[10px] font-normal tracking-[-0.01em]" style={{ color: "hsl(213, 27%, 62%)", opacity: 0.4 }}>
                Powered by slate.
              </div>
            )}
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        title="Reset Demo?"
        description="This will restore the default Harbour Fish Co. data and remove all demo customisations."
        confirmText="Reset"
        onConfirm={handleReset}
        destructive
      />
    </SidebarProvider>
  );
}
