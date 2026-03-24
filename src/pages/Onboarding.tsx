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

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const { session } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session.supabaseUser?.id;

  // Load profile and resume at saved step
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) {
        setProfile(data);
        const savedStep = (data as any).onboarding_step || 1;
        setStep(savedStep);
        if ((data as any).onboarding_completed) {
          navigate("/dashboard", { replace: true });
          return;
        }
      }
      setLoading(false);
    };
    load();
  }, [userId, navigate]);

  const goNext = async () => {
    const next = Math.min(step + 1, TOTAL_STEPS);
    setStep(next);
    // Refresh profile for latest data
    if (userId) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setProfile(data);
    }
  };

  const skip = async () => {
    if (userId) {
      await supabase.from("profiles").update({ onboarding_step: step + 1 } as any).eq("id", userId);
    }
    goNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
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
                if (userId) await supabase.from("profiles").update({ onboarding_step: 2 } as any).eq("id", userId);
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
