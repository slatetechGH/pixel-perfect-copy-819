import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SlateLogo from "@/components/SlateLogo";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.co.uk"
                className="w-full h-11 px-4 rounded-lg border border-slate-light/40 bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-lg border border-slate-light/40 bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
              />
            </div>

            <Button variant="slate" className="w-full h-11 text-[15px]" type="submit">
              Log in
            </Button>
          </form>

          <div className="mt-4 text-center">
            {forgotSent ? (
              <p className="text-[14px] text-success">Check your inbox for a reset link.</p>
            ) : (
              <button
                onClick={() => setForgotSent(true)}
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
