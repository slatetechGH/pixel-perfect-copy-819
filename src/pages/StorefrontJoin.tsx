import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";

const StorefrontJoin = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { settings } = useDashboard();
  const { accentColor } = useApp();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
        if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("exists")) {
          toast.error("An account with this email already exists. Try logging in instead.");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Look up the producer by slug so we can link the customer
        const { data: producerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("url_slug", businessSlug)
          .single();

        // If a session was returned, email confirmation is disabled — user is signed in
        if (data.session) {
          // Assign customer role
          try {
            await supabase.rpc("assign_customer_role" as any);
          } catch {
            // Fallback: try direct insert
            await supabase.from("user_roles").insert({ user_id: data.user.id, role: "customer" } as any);
          }

          // Create customer_profiles link
          if (producerProfile) {
            await supabase.from("customer_profiles").insert({
              user_id: data.user.id,
              producer_id: producerProfile.id,
              name: name.trim(),
            } as any);
          }

          toast.success(`Welcome to ${settings.businessName}!`);
          navigate(`/store/${businessSlug}/account`, { replace: true });
        } else {
          // Email confirmation required — try to assign role/profile anyway
          try {
            await supabase.rpc("assign_customer_role" as any);
          } catch {
            // Will be handled by trigger or on first login
          }
          if (producerProfile) {
            await supabase.from("customer_profiles").insert({
              user_id: data.user.id,
              producer_id: producerProfile.id,
              name: name.trim(),
            } as any).then(() => {});
          }

          // Show confirmation message
          setShowConfirmation(true);
          toast.success("Account created!");
        }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      // Check the user's role to redirect appropriately
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        const role = roles?.[0]?.role;

        toast.success("Welcome back!");

        if (role === "customer") {
          navigate("/my-account", { replace: true });
        } else if (role === "producer" || role === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          // No role found — assume customer (signed up through storefront)
          try {
            await supabase.from("user_roles").insert({ user_id: data.user.id, role: "customer" } as any);
          } catch { /* ignore */ }
          navigate("/my-account", { replace: true });
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const logoInitial = settings.businessName ? settings.businessName.charAt(0).toUpperCase() : "S";

  // Show confirmation message after signup when email confirmation is required
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-6">
          <button
            onClick={() => navigate(`/store/${businessSlug}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {settings.businessName}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-bold text-foreground mb-2">Account created!</h1>
            <p className="text-muted-foreground mb-6">
              Check your email to confirm your account, then come back and log in.
            </p>
            <Button
              variant="outline"
              onClick={() => { setShowConfirmation(false); setMode("login"); }}
              className="mx-auto"
            >
              Go to Log In
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
