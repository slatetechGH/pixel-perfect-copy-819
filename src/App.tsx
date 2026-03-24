import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
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

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { session, authLoading } = useApp();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" /></div>;
  if (!session.isLoggedIn) return <Navigate to="/login" replace />;
  
  // Role-based access: if allowedRoles specified, check the user's role
  if (allowedRoles && (!session.role || !allowedRoles.includes(session.role))) {
    // Redirect to appropriate home based on whatever role they do have
    if (session.role === "customer") return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
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
      <Route path="/demo-setup" element={<ProtectedRoute allowedRoles={["admin"]}><DemoSetup /></ProtectedRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Customer-facing storefront — public, no auth */}
      <Route path="/store/:businessSlug" element={<Storefront />} />
      <Route path="/store/:businessSlug/content/:contentId" element={<StorefrontContent />} />
      <Route path="/store/:businessSlug/join" element={<StorefrontJoin />} />
      <Route path="/store/:businessSlug/account" element={<StorefrontAccount />} />

      {/* Dashboard — protected, admin + producer only */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Index /></ProtectedRoute>} />
      <Route path="/dashboard/subscribers" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Subscribers /></ProtectedRoute>} />
      <Route path="/dashboard/plans" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Plans /></ProtectedRoute>} />
      <Route path="/dashboard/content" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Content /></ProtectedRoute>} />
      <Route path="/dashboard/drops" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Drops /></ProtectedRoute>} />
      <Route path="/dashboard/messages" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Messages /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/leads" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Leads /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["admin", "producer"]}><Settings /></ProtectedRoute>} />

      {/* Admin — admin only */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>} />
      <Route path="/admin/producers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProducers /></ProtectedRoute>} />

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
