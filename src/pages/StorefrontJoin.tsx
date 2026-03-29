import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";

const StorefrontJoin = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { settings } = useDashboard();
  const { accentColor, session } = useApp();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in as customer, redirect to account page
  if (session.isLoggedIn && session.role === "customer") {
    navigate(`/store/${businessSlug}/account`, { replace: true });
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/store/${businessSlug}`,
          data: { display_name: name.trim() },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Assign customer role via secure RPC (the trigger creates 'producer' by default)
        await supabase.rpc("assign_customer_role" as any);

        // Create customer_profiles link to this producer
        const producerSlug = settings.urlSlug || settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        // Find producer profile by slug
        const { data: producerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("url_slug", producerSlug)
          .single();

        if (producerProfile) {
          await supabase.from("customer_profiles").insert({
            user_id: data.user.id,
            producer_id: producerProfile.id,
            name: name.trim(),
          } as any);
        }

        toast.success("Account created! Check your email to verify.");
        navigate(`/store/${businessSlug}`, { replace: true });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
      navigate(`/store/${businessSlug}`, { replace: true });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const logoInitial = settings.businessName ? settings.businessName.charAt(0).toUpperCase() : "S";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(`/store/${businessSlug}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {settings.businessName}
        </button>
      </div>

      {/* Form container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Producer branding */}
          <div className="text-center mb-8">
            {settings.logoUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-border">
                <img src={settings.logoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: accentColor }}
              >
                <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  {logoInitial}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground">
              {mode === "signup" ? `Join ${settings.businessName}` : `Log in to ${settings.businessName}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signup"
                ? "Create your account to subscribe and access exclusive content"
                : "Welcome back"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {mode === "signup" ? "Creating account…" : "Logging in…"}</>
              ) : (
                mode === "signup" ? "Create Account" : "Log In"
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-medium hover:underline cursor-pointer"
                  style={{ color: accentColor }}
                >
                  Log in
                </button>
              </>
            ) : (
              <>Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="font-medium hover:underline cursor-pointer"
                  style={{ color: accentColor }}
                >
                  Sign up
                </button>
              </>
            )}
          </p>

          {/* Powered by Slate */}
          <div className="flex items-center justify-center gap-1.5 mt-10 opacity-40">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <SlateLogo size={12} asLink={false} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StorefrontJoin;
