import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import SlateLogo from "@/components/SlateLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasRecovery, setHasRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setHasRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password || password.length < 6) errs.password = "Min 6 characters";
    if (password !== confirm) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrors({ password: error.message });
      return;
    }

    setDone(true);
    toast.success("Password updated!");
  };

  if (!hasRecovery && !done) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="mb-8 cursor-pointer" onClick={() => navigate("/")}>
            <SlateLogo size={30} />
          </div>
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h1 className="text-xl font-bold text-foreground mb-2">Invalid reset link</h1>
            <p className="text-sm text-muted-foreground mb-6">This link has expired or is invalid. Please request a new one.</p>
            <Button variant="slate" onClick={() => navigate("/login")}>Back to login</Button>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all ${errors[field] ? "border-destructive" : "border-slate-light/40"}`;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <SlateLogo size={30} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-amber" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">Password updated</h1>
              <p className="text-sm text-muted-foreground mb-6">You can now log in with your new password.</p>
              <Button variant="slate" onClick={() => navigate("/login")}>Go to login</Button>
            </div>
          ) : (
            <>
              <h1 className="text-[24px] font-bold text-foreground mb-1">Set new password</h1>
              <p className="text-[14px] text-slate-mid mb-6">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                    placeholder="Min 6 characters"
                    className={inputCls("password")}
                  />
                  {errors.password && <p className="text-[13px] text-destructive mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.confirm; return n; }); }}
                    placeholder="Re-enter password"
                    className={inputCls("confirm")}
                  />
                  {errors.confirm && <p className="text-[13px] text-destructive mt-1">{errors.confirm}</p>}
                </div>
                <Button variant="slate" className="w-full h-11 text-[15px]" type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</> : "Update password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;