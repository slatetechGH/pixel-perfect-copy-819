import { Shield, Landmark, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  profile: Record<string, any>;
  userId: string;
  onContinue: () => void;
  onSkip: () => void;
}

export default function OnboardingPayments({ profile, userId, onContinue, onSkip }: Props) {
  const isConnected = profile?.stripe_connect_status === "active";

  const handleStripeConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", {
        body: { action: "create_account", return_url: `${window.location.origin}/onboarding` },
      });
      if (data?.url) {
        // Save step before redirecting
        await supabase.from("profiles").update({ onboarding_step: 4 } as any).eq("id", userId);
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Failed to start Stripe setup");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleContinue = async () => {
    await supabase.from("profiles").update({ onboarding_step: 5 } as any).eq("id", userId);
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <h1 className="text-[28px] md:text-[32px] font-bold text-foreground tracking-[-0.01em] mb-1">
        Get paid
      </h1>
      <p className="text-[16px] text-muted-foreground mb-8">
        Enter your bank details so subscriber payments go straight to your account. Powered by Stripe — secure and instant.
      </p>

      <div className="space-y-4 mb-8 text-left">
        {[
          { icon: Shield, label: "Bank-level security" },
          { icon: Landmark, label: "Payments go directly to your account" },
          { icon: PieChart, label: "Slate takes 8% commission, you keep the rest" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-[15px] text-foreground">
            <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-amber" />
            </div>
            {label}
          </div>
        ))}
      </div>

      {isConnected ? (
        <div className="bg-amber/5 border border-amber/20 rounded-lg p-4 mb-6">
          <p className="text-[15px] text-foreground font-medium">✓ Stripe connected — you're ready to accept payments!</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {isConnected ? (
          <Button variant="slate" className="w-full h-11 text-[15px]" onClick={handleContinue}>
            Continue →
          </Button>
        ) : (
          <>
            <Button variant="slate" className="w-full h-11 text-[15px]" onClick={handleStripeConnect}>
              Set up payments →
            </Button>
            <button onClick={async () => { await handleContinue(); }} className="w-full text-center text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              I'll connect payments later
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
