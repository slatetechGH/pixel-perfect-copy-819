import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Subscribers from "./pages/Subscribers.tsx";
import Plans from "./pages/Plans.tsx";
import Content from "./pages/Content.tsx";
import Drops from "./pages/Drops.tsx";
import Messages from "./pages/Messages.tsx";
import Analytics from "./pages/Analytics.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import Marketing from "./pages/Marketing.tsx";
import Login from "./pages/Login.tsx";
import Contact from "./pages/Contact.tsx";
import GetStarted from "./pages/GetStarted.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";

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

          {/* Dashboard */}
          <Route path="/dashboard" element={<Index />} />
          <Route path="/dashboard/subscribers" element={<Subscribers />} />
          <Route path="/dashboard/plans" element={<Plans />} />
          <Route path="/dashboard/content" element={<Content />} />
          <Route path="/dashboard/drops" element={<Drops />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/settings" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
