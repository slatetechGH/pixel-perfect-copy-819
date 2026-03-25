import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";

/**
 * DemoPreview — bridge route that reads demo config from localStorage,
 * activates demo mode on AppContext, populates DashboardContext with
 * the generated demo data, then navigates to /dashboard so the real
 * producer dashboard renders with demo data.
 *
 * Opened in a new tab by DemoSetup so the admin's original tab is unaffected.
 */
const DemoPreview = () => {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const { activateDemo, demoActive } = useApp();
  const {
    setPlans, setDrops, setContent, setSubscribers, setConversations, setSettings,
    setKpiData, setRevenueChartData, setSubscriberGrowthData, setActivityFeed,
    setTierBreakdown, setRevenueDataSets,
  } = useDashboard();

  const [error, setError] = useState(false);
  const [populated, setPopulated] = useState(false);

  // Step 1: Read localStorage and activate demo mode
  useEffect(() => {
    const raw = localStorage.getItem("slate_demo_preview");
    if (!raw) {
      setError(true);
      return;
    }

    try {
      const data = JSON.parse(raw);
      const s = data.settings;

      // Activate demo mode on AppContext
      activateDemo(s.businessName, s.accentColor || "#F59E0B");

      // Populate DashboardContext with all demo data
      if (data.plans) setPlans(data.plans);
      if (data.drops) setDrops(data.drops);
      if (data.content) setContent(data.content);
      if (data.subscribers) setSubscribers(data.subscribers);
      if (data.conversations) setConversations(data.conversations);
      if (data.kpi) setKpiData(data.kpi);
      if (data.revenueChartData) setRevenueChartData(data.revenueChartData);
      if (data.subscriberGrowthData) setSubscriberGrowthData(data.subscriberGrowthData);
      if (data.activityFeed) setActivityFeed(data.activityFeed);
      if (data.tierBreakdown) setTierBreakdown(data.tierBreakdown);
      if (data.revenueDataSets) setRevenueDataSets(data.revenueDataSets);

      // Populate settings
      setSettings(prev => ({
        ...prev,
        businessName: s.businessName || prev.businessName,
        businessType: s.businessType || prev.businessType,
        description: s.description || prev.description,
        email: s.email || prev.email,
        phone: s.phone || prev.phone,
        website: s.website || prev.website,
        urlSlug: s.urlSlug || prev.urlSlug,
        accentColor: s.accentColor || prev.accentColor,
        logoUrl: s.logoUrl ?? prev.logoUrl,
        coverUrl: s.coverUrl ?? prev.coverUrl,
        publicVisible: true,
        stripeConnectStatus: "connected",
      }));

      setPopulated(true);
    } catch {
      setError(true);
    }
  }, []); // Run once on mount

  // Step 2: Once data is populated and demo mode is active, navigate to /dashboard
  useEffect(() => {
    if (populated && demoActive) {
      navigate("/dashboard", { replace: true });
    }
  }, [populated, demoActive, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-[16px] font-medium text-foreground mb-2">No demo data found</p>
          <p className="text-[14px] text-muted-foreground">Launch a demo from the Demo Launcher first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-3" />
        <p className="text-[14px] text-muted-foreground">Loading demo...</p>
      </div>
    </div>
  );
};

export default DemoPreview;
