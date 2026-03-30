import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";
import { getUserRole } from "@/lib/auth-routing";

interface PendingPlanInfo {
  id: string;
  name: string;
  price_num: number;
}

const StorefrontJoin = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useDashboard();
  const { accentColor, setSession } = useApp();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PendingPlanInfo | null>(null);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);

  // Fetch pending plan info from URL params
  useEffect(() => {
    const planId = searchParams.get("plan") || localStorage.getItem("pending_plan_id");
    if (!planId) return;

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("plans")
        .select("id, name, price_num")
        .eq("id", planId)
        .single();

      if (data) {
        setPendingPlan({ id: data.id, name: data.name, price_num: data.price_num });
      }
    };
    fetchPlan();
  }, [searchParams]);

  const getProducerIdBySlug = async (producerSlug: string) => {
    const { data: producer } = await supabase
      .from("public_profiles")
      .select("id")
      .eq("url_slug", producerSlug)
      .single();

    return producer?.id ?? null;
  };

  const ensureStorefrontCustomerRole = async (userId: string) => {
    const existingRole = await getUserRole(userId);

    if (existingRole === "customer") {
      setSession((prev) => ({ ...prev, role: "customer" }));
      return existingRole;
    }

    if (!businessSlug) return existingRole;

    const producerId = await getProducerIdBySlug(businessSlug);
    if (!producerId) return existingRole;

    const pendingPlanId = searchParams.get("plan") || localStorage.getItem("pending_plan_id");
    const { data: customerLink } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", userId)
      .eq("producer_id", producerId)
      .maybeSingle();

    if (!customerLink && !pendingPlanId) return existingRole;

    const { error: assignError } = await supabase.rpc("assign_customer_role" as any);

    if (assignError && !existingRole) {
      await supabase.from("user_roles").insert({ user_id: userId, role: "customer" } as any);
    }

    const normalizedRole = await getUserRole(userId);

    if (normalizedRole === "customer") {
      setSession((prev) => ({ ...prev, role: "customer" }));
    }

    return normalizedRole;
  };

  const startCheckout = async (planId: string, producerSlug: string) => {
    setCheckoutInProgress(true);
    toast("Signing you in and starting checkout...");

    try {
      const producerId = await getProducerIdBySlug(producerSlug);

      if (!producerId) {
        toast.error("Could not find producer. Please try again.");
        setCheckoutInProgress(false);
        return;
      }

      const response = await supabase.functions.invoke("checkout-session", {
        body: {
          plan_id: planId,
          producer_id: producerId,
          success_url: `${window.location.origin}/my-account?welcome=true`,
          cancel_url: `${window.location.origin}/store/${producerSlug}`,
        },
      });

      console.log("Checkout response:", response);

      if (response.error || response.data?.error) {
        const errorMsg = response.data?.error || (response.error instanceof Error ? response.error.message : "Checkout failed");
        console.error("Checkout error:", response.error || response.data?.error);
        toast.error(errorMsg);
        setCheckoutInProgress(false);
        return;
      }

      if (response.data?.url) {
        localStorage.removeItem("pending_plan_id");
        window.location.href = response.data.url;
      } else {
        toast.error("No checkout URL returned. Please try again.");
        setCheckoutInProgress(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setCheckoutInProgress(false);
    }
  };

  const handlePostAuth = async (userId: string) => {
    const role = await ensureStorefrontCustomerRole(userId);
    const planId = searchParams.get("plan") || localStorage.getItem("pending_plan_id");

    if (role === "customer" && planId && businessSlug) {
      await startCheckout(planId, businessSlug);
    } else {
      localStorage.removeItem("pending_plan_id");
      navigate("/my-account", { replace: true });
    }
  };

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
          await handlePostAuth(data.user.id);
        } else {
          // Email confirmation required
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

      if (data.user) {
        toast.success("Welcome back!");
        await handlePostAuth(data.user.id);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const logoInitial = settings.businessName ? settings.businessName.charAt(0).toUpperCase() : "S";

  // Show checkout in progress
  if (checkoutInProgress) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Starting checkout...</p>
        </div>
      </div>
    );
  }

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

            {/* Pending plan context message */}
            {pendingPlan ? (
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "signup"
                  ? `Create an account to subscribe to ${pendingPlan.name} at £${pendingPlan.price_num}/mo`
                  : `Log in to subscribe to ${pendingPlan.name} at £${pendingPlan.price_num}/mo`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "signup"
                  ? "Create your account to subscribe and access exclusive content"
                  : "Welcome back"}
              </p>
            )}
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

          {/* Forgot password — login mode only */}
          {mode === "login" && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={async () => {
                  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    toast.error("Enter your email address first");
                    return;
                  }
                  await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  toast.success("Password reset email sent — check your inbox");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

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