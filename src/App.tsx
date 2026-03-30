import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Index from "./pages/Index";
import AdminCommandCentre from "./pages/AdminCommandCentre";
import Subscribers from "./pages/Subscribers";
import Plans from "./pages/Plans";
import Content from "./pages/Content";
import Drops from "./pages/Drops";
import Broadcasts from "./pages/Broadcasts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import Collections from "./pages/Collections";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import Marketing from "./pages/Marketing";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DemoSetup from "./pages/DemoSetup";
import Storefront from "./pages/Storefront";
import StorefrontContent from "./pages/StorefrontContent";
import StorefrontAccount from "./pages/StorefrontAccount";
import StorefrontJoin from "./pages/StorefrontJoin";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import AdminProducers from "./pages/AdminProducers";
import AdminRevenue from "./pages/AdminRevenue";
import AdminMeetings from "./pages/AdminMeetings";
import AdminHealth from "./pages/AdminHealth";
import Cookies from "./pages/Cookies";
import StorefrontWelcome from "./pages/StorefrontWelcome";
import Onboarding from "./pages/Onboarding";
import DemoPreview from "./pages/DemoPreview";
import MyAccount from "./pages/MyAccount";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { session, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" /></div>;
  if (!session.isLoggedIn) return <Navigate to="/login" replace />;
  
  // While role is hydrating, keep authenticated users in dashboard flow instead of bouncing to landing
  if (allowedRoles && !session.role) {
    if (location.pathname.startsWith("/dashboard")) return <>{children}</>;
    return <Navigate to="/dashboard" replace />;
  }

  // Role-based access: if allowedRoles specified, check the user's role
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (session.role === "customer") return <Navigate to="/" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function RoleBasedDashboard() {
  const { session, demoActive } = useApp();
  // In demo mode, always show the producer dashboard (even for admins)
  if (session.role === "admin" && !demoActive) return <AdminCommandCentre />;
  // Redirect producers who haven't completed onboarding
  if (session.role === "producer" && !demoActive && session.profile && !(session.profile as any).onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Index />;
}

const AppRoutes = () => (
  <DashboardProvider>
    <Routes>
      {/* Marketing site */}
      <Route path="/" element={<Marketing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/demo-setup" element={<ProtectedRoute allowedRoles={["admin"]}><DemoSetup /></ProtectedRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/demo-preview/:businessSlug" element={<DemoPreview />} />
      <Route path="/onboarding" element={<ProtectedRoute allowedRoles={["producer"]}><Onboarding /></ProtectedRoute>} />

      {/* Customer-facing storefront — public, no auth */}
      <Route path="/store/:businessSlug" element={<Storefront />} />
      <Route path="/store/:businessSlug/content/:contentId" element={<StorefrontContent />} />
      <Route path="/store/:businessSlug/join" element={<StorefrontJoin />} />
      <Route path="/store/:businessSlug/account" element={<StorefrontAccount />} />
      <Route path="/store/:businessSlug/welcome" element={<StorefrontWelcome />} />

      {/* Dashboard — protected, admin + producer only */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/subscribers" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Subscribers /></ProtectedRoute>} />
      <Route path="/dashboard/plans" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Plans /></ProtectedRoute>} />
      <Route path="/dashboard/content" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Content /></ProtectedRoute>} />
      <Route path="/dashboard/drops" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Drops /></ProtectedRoute>} />
      <Route path="/dashboard/broadcasts" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Broadcasts /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/leads" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Leads /></ProtectedRoute>} />
      <Route path="/dashboard/collections" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Collections /></ProtectedRoute>} />
      <Route path="/dashboard/upgrade" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Upgrade /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Settings /></ProtectedRoute>} />

      {/* Admin — admin only */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>} />
      <Route path="/admin/producers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProducers /></ProtectedRoute>} />
      <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRevenue /></ProtectedRoute>} />
      <Route path="/admin/meetings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMeetings /></ProtectedRoute>} />
      <Route path="/admin/health" element={<ProtectedRoute allowedRoles={["admin"]}><AdminHealth /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </DashboardProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
