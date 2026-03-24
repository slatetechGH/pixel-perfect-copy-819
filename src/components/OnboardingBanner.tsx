import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function OnboardingBanner() {
  const { session } = useApp();

  if (!session.isLoggedIn || session.role !== "producer") return null;
  if (!session.profile) return null;
  if ((session.profile as any).onboarding_completed) return null;

  return (
    <div className="bg-amber/10 border-b border-amber/20 px-4 md:px-8 py-2.5 flex items-center justify-between">
      <p className="text-[13px] text-foreground">
        You haven't finished setting up —{" "}
        <Link to="/onboarding" className="text-amber font-medium hover:underline inline-flex items-center gap-1">
          Pick up where you left off <ArrowRight size={13} />
        </Link>
      </p>
    </div>
  );
}
