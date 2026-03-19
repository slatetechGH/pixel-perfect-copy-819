import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useApp();
  if (!session.isLoggedIn) return <Navigate to="/login" replace />;
  return <DashboardProvider>{children}</DashboardProvider>;
}

const AppRoutes = () => (
  <Routes>
    {/* Marketing site */}
    <Route path="/" element={<Marketing />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/get-started" element={<GetStarted />} />
    <Route path="/login" element={<Login />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />

    {/* Dashboard — protected + wrapped in provider */}
    <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/dashboard/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
    <Route path="/dashboard/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
    <Route path="/dashboard/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
    <Route path="/dashboard/drops" element={<ProtectedRoute><Drops /></ProtectedRoute>} />
    <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="/dashboard/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
    <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
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
