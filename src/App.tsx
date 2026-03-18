import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider } from "@/contexts/DashboardContext";
import Index from "./pages/Index";
import Subscribers from "./pages/Subscribers";
import Plans from "./pages/Plans";
import Content from "./pages/Content";
import Drops from "./pages/Drops";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Marketing from "./pages/Marketing";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing site */}
          <Route path="/" element={<Marketing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Dashboard — wrapped in provider */}
          <Route path="/dashboard" element={<DashboardProvider><Index /></DashboardProvider>} />
          <Route path="/dashboard/subscribers" element={<DashboardProvider><Subscribers /></DashboardProvider>} />
          <Route path="/dashboard/plans" element={<DashboardProvider><Plans /></DashboardProvider>} />
          <Route path="/dashboard/content" element={<DashboardProvider><Content /></DashboardProvider>} />
          <Route path="/dashboard/drops" element={<DashboardProvider><Drops /></DashboardProvider>} />
          <Route path="/dashboard/messages" element={<DashboardProvider><Messages /></DashboardProvider>} />
          <Route path="/dashboard/analytics" element={<DashboardProvider><Analytics /></DashboardProvider>} />
          <Route path="/dashboard/settings" element={<DashboardProvider><Settings /></DashboardProvider>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
