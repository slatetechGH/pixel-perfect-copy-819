import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SlateLogo from "@/components/SlateLogo";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { session } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already logged in, redirect based on role
  if (session.isLoggedIn) {
    const dest = session.role === "admin" ? "/admin" : session.role === "customer" ? "/" : "/dashboard";
    navigate(dest, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email required";
    if (!password || password.length < 3) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login")) {
        setErrors({ password: "Invalid email or password" });
      } else if (error.message.includes("Email not confirmed")) {
        setErrors({ email: "Please confirm your email first" });
      } else {
        setErrors({ password: error.message });
      }
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter your email address first" });
      return;
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <SlateLogo size={30} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-[24px] font-bold text-foreground mb-1">Log in</h1>
          <p className="text-[14px] text-slate-mid mb-6">Welcome back to Slate.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }}
                placeholder="you@yourbusiness.co.uk"
                className={`w-full h-11 px-4 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all ${errors.email ? "border-destructive" : "border-slate-light/40"}`}
              />
              {errors.email && <p className="text-[13px] text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                placeholder="••••••••"
                className={`w-full h-11 px-4 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all ${errors.password ? "border-destructive" : "border-slate-light/40"}`}
              />
              {errors.password && <p className="text-[13px] text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button variant="slate" className="w-full h-11 text-[15px]" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...</> : "Log in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            {forgotSent ? (
              <p className="text-[14px] text-success">We've sent a reset link to your email.</p>
            ) : (
              <button
                onClick={handleForgotPassword}
                className="text-[14px] text-slate-mid hover:text-foreground transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-[14px] text-slate-mid">
          Don't have an account?{" "}
          <button onClick={() => navigate("/get-started")} className="text-amber hover:text-amber-hover font-medium cursor-pointer">
            Get started
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
