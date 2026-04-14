import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import SlateLogo from "@/components/SlateLogo";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { getAuthRoutingState } from "@/lib/auth-routing";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { demoActive, demoBusinessName, deactivateDemo, accentColor, session } = useApp();
  const { resetToDefaults, settings } = useDashboard();
  const navigate = useNavigate();
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!session.supabaseUser?.id || demoActive) return;

    const guardCustomerAccess = async () => {
      const routeState = await getAuthRoutingState(session.supabaseUser!.id);
      if (!cancelled && routeState.role === "customer") {
        navigate("/my-account", { replace: true });
      }
    };

    guardCustomerAccess();

    return () => {
      cancelled = true;
    };
  }, [session.supabaseUser?.id, demoActive, navigate]);

  const handleReset = () => {
    resetToDefaults();
    deactivateDemo();
    localStorage.removeItem("slate_demo_preview");
    // If this is a demo tab, close it; otherwise navigate home
    if (window.opener || window.history.length <= 2) {
      window.close();
    } else {
      navigate("/dashboard");
    }
  };

  const now = new Date();
  const monthYear = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Determine if this is the main dashboard overview page
  const isDashboardHome = title === "Dashboard";

  // Build display title — in demo mode, prefix with business name for relevant pages
  const demoTitleMap: Record<string, string> = {
    "Plans": `${settings.businessName} Plans`,
    "Product Drops": `${settings.businessName} Drops`,
    "Content": `${settings.businessName} Content`,
    "Subscribers": `${settings.businessName} Subscribers`,
    "Analytics": `${settings.businessName} Analytics`,
    "Settings": `${settings.businessName} Settings`,
  };
  const displayTitle = demoActive
    ? (isDashboardHome ? settings.businessName.toUpperCase() : (demoTitleMap[title] || title))
    : title;

  const displaySubtitle = demoActive && isDashboardHome
    ? `Overview — ${monthYear}`
    : subtitle;

  const profileBusinessName = session.profile?.business_name || "";
  const storefrontSlug =
    settings.urlSlug ||
    settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    session.profile?.url_slug ||
    (profileBusinessName
      ? profileBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MerchantSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-w-[100vw]">
          <OnboardingBanner />
          {/* Demo mode strip */}
          {demoActive && (
            <div
              className="flex items-center justify-between px-4 md:px-8 shrink-0 overflow-hidden"
              style={{
                height: 36,
                backgroundColor: `${accentColor}14`,
              }}
            >
              <span className="text-[12px] font-medium truncate mr-2" style={{ color: accentColor }}>
                Demo Mode — {demoBusinessName}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium shrink-0" style={{ color: "hsl(215, 16%, 47%)" }}>
                {storefrontSlug && (
                  <>
                    <button
                      onClick={() => {
                        const raw = localStorage.getItem("slate_demo_preview");
                        if (raw) localStorage.setItem("slate_demo_storefront", raw);
                        window.open(`/demo-storefront/${storefrontSlug}`, "_blank");
                      }}
                      className="hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5"
                    >
                      Preview Storefront
                    </button>
                    <span className="opacity-40">·</span>
                  </>
                )}
                <button
                  onClick={() => {
                    // Navigate back to demo setup in the admin's original tab won't work
                    // since this is a new tab. Instead, close and re-open from admin.
                    window.open("/demo-setup", "_blank");
                  }}
                  className="hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5"
                >
                  Edit Demo
                </button>
                <span className="opacity-40">·</span>
                <button
                  onClick={() => setResetConfirm(true)}
                  className="hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5"
                >
                  Close Demo
                </button>
              </div>
            </div>
          )}

          <main className="flex-1 p-4 md:p-8 overflow-auto overflow-x-hidden relative">
            {/* Cover photo banner (demo mode with cover) */}
            {demoActive && settings.coverUrl && isDashboardHome && (
              <div
                className="relative w-full rounded-xl overflow-hidden mb-6 -mt-2"
                style={{ height: 140 }}
              >
                <img src={settings.coverUrl} alt="" className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }}
                />
                <div className="absolute bottom-4 left-5">
                  <h1 className="text-white font-bold leading-tight" style={{ fontSize: 28 }}>
                    {settings.businessName.toUpperCase()}
                  </h1>
                  <p className="text-white/70 text-[14px] mt-0.5">Overview — {monthYear}</p>
                </div>
              </div>
            )}

            {/* Page header — hide if cover photo shown on dashboard home */}
            {!(demoActive && settings.coverUrl && isDashboardHome) && (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="text-muted-foreground -ml-2 mr-1" />
                    <h1
                      className="font-bold text-foreground leading-tight break-words"
                      style={{ fontSize: demoActive && isDashboardHome ? 28 : 24 }}
                    >
                      {displayTitle}
                    </h1>
                  </div>
                  {displaySubtitle && (
                    <p className="text-[14px] text-muted-foreground mt-0.5 ml-9">{displaySubtitle}</p>
                  )}
                  {demoActive && isDashboardHome && settings.description && (
                    <p className="text-[14px] italic mt-0.5 ml-9" style={{ color: "hsl(213, 27%, 62%)" }}>
                      {settings.description}
                    </p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-3 flex-wrap ml-9 sm:ml-0">{actions}</div>}
              </div>
            )}

            {/* If cover photo shown, still render actions row */}
            {demoActive && settings.coverUrl && isDashboardHome && actions && (
              <div className="flex justify-end mb-5">
                <div className="flex items-center gap-3">{actions}</div>
              </div>
            )}

            {children}

            {/* Powered by watermark */}
            {demoActive && (
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-3 right-4 flex items-center gap-1 transition-opacity duration-200 cursor-pointer group"
                style={{ opacity: 0.3 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
              >
                <span className="text-[11px] font-normal" style={{ color: "hsl(213, 27%, 62%)" }}>
                  Powered by
                </span>
                <SlateLogo size={11} asLink={false} />
              </a>
            )}
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        title="Close Demo?"
        description="This will close the demo preview and clear the demo data."
        confirmText="Close Demo"
        onConfirm={handleReset}
        destructive
      />
    </SidebarProvider>
  );
}
