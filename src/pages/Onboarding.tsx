import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SlateLogo from "@/components/SlateLogo";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingWelcome from "@/components/onboarding/OnboardingWelcome";
import OnboardingBrand from "@/components/onboarding/OnboardingBrand";
import OnboardingPlan from "@/components/onboarding/OnboardingPlan";
import OnboardingPayments from "@/components/onboarding/OnboardingPayments";
import OnboardingShare from "@/components/onboarding/OnboardingShare";
import { toast } from "sonner";

const TOTAL_STEPS = 5;
const LOAD_TIMEOUT_MS = 8000;

const Onboarding = () => {
  const { session, setSession } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session.supabaseUser?.id;

  // Load profile and resume at saved step — with timeout
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const loadTimeout = setTimeout(() => {
      if (cancelled) return;
      console.warn("Onboarding profile load timed out");
      setLoading(false);
      setError("Loading took too long. Please try refreshing the page.");
    }, LOAD_TIMEOUT_MS);

    const load = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (cancelled) return;
        clearTimeout(loadTimeout);

        if (fetchErr) {
          console.error("Profile fetch error:", fetchErr);
          setLoading(false);
          setError("Failed to load your profile. Please refresh the page.");
          return;
        }

        if (data) {
          setProfile(data);
          const savedStep = (data as any).onboarding_step || 1;
          setStep(savedStep);
          if ((data as any).onboarding_completed) {
            // Also update AppContext to prevent redirect loop
            setSession((prev) => ({
              ...prev,
              profile: { ...prev.profile, onboarding_completed: true },
            }));
            navigate("/dashboard", { replace: true });
            return;
          }
        }
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        clearTimeout(loadTimeout);
        console.error("Onboarding load error:", err);
        setLoading(false);
        setError("Something went wrong. Please refresh the page.");
      }
    };
    load();

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
    };
  }, [userId, navigate, setSession]);

  const goNext = async () => {
    const next = Math.min(step + 1, TOTAL_STEPS);
    setStep(next);
    // Refresh profile for latest data (with timeout)
    if (userId) {
      try {
        const fetchPromise = supabase.from("profiles").select("*").eq("id", userId).single();
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
        const result = await Promise.race([fetchPromise, timeout]);
        if (result && 'data' in result && result.data) {
          setProfile(result.data);
        }
      } catch {
        // Non-critical — continue with current profile
      }
    }
  };

  const skip = async () => {
    if (userId) {
      try {
        await Promise.race([
          supabase.from("profiles").update({ onboarding_step: step + 1 } as any).eq("id", userId),
          new Promise((_, reject) => setTimeout(() => reject("timeout"), 5000)),
        ]);
      } catch {
        // Non-critical
      }
    }
    goNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium text-foreground mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium"
            >
              Refresh page
            </button>
            <button
              onClick={() => navigate("/dashboard", { replace: true })}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-8 pb-2">
        <SlateLogo size={24} />
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto w-full px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-6 pb-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <OnboardingWelcome
              key="welcome"
              onContinue={async () => {
                if (userId) {
                  try {
                    await Promise.race([
                      supabase.from("profiles").update({ onboarding_step: 2 } as any).eq("id", userId),
                      new Promise((_, reject) => setTimeout(() => reject("timeout"), 5000)),
                    ]);
                  } catch { /* continue anyway */ }
                }
                goNext();
              }}
            />
          )}
          {step === 2 && profile && userId && (
            <OnboardingBrand key="brand" profile={profile} userId={userId} onContinue={goNext} onSkip={skip} />
          )}
          {step === 3 && userId && (
            <OnboardingPlan key="plan" userId={userId} onContinue={goNext} onSkip={skip} />
          )}
          {step === 4 && profile && userId && (
            <OnboardingPayments key="payments" profile={profile} userId={userId} onContinue={goNext} onSkip={skip} />
          )}
          {step === 5 && profile && userId && (
            <OnboardingShare key="share" profile={profile} userId={userId} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
